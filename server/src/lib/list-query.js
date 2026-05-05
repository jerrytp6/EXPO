// List endpoint helpers — search / filter / pagination
//
// 用法：
//   const opts = parseListOpts(req, { searchFields: ["company", "contact", "email"] });
//   const where = { ...scopeWhere(req), ...opts.where };
//   const [items, total] = await Promise.all([
//     prisma.vendor.findMany({ where, orderBy, skip: opts.skip, take: opts.take }),
//     prisma.vendor.count({ where }),
//   ]);
//   return sendList(res, req, items, total);
//
// 慣例：
//   ?q=foo            keyword search 用 OR 包指定 searchFields，全 contains，insensitive
//   ?status=submitted filter
//   ?limit=20 ?offset=40  pagination
//   ?meta=1           回 { items, total, hasMore, limit, offset }；否則回陣列 + X-Total-Count

export function parseListOpts(req, { searchFields = [], allowedFilters = [] } = {}) {
  const limit = Math.min(parseInt(req.query.limit || "0", 10) || 0, 500);
  const offset = parseInt(req.query.offset || "0", 10) || 0;
  const where = {};

  // keyword search across given fields
  const q = (req.query.q || "").toString().trim();
  if (q && searchFields.length) {
    where.OR = searchFields.map((f) => ({ [f]: { contains: q } }));
  }

  // 直接 filter（如 status / role / scope）
  for (const k of allowedFilters) {
    const v = req.query[k];
    if (v != null && v !== "") where[k] = v;
  }

  return {
    where,
    skip: offset || undefined,
    take: limit || undefined,
    limit,
    offset,
  };
}

export function sendList(res, req, items, total) {
  res.setHeader("X-Total-Count", String(total));
  if (req.query.meta === "1" || req.query.meta === "true") {
    const limit = parseInt(req.query.limit || "0", 10) || items.length;
    const offset = parseInt(req.query.offset || "0", 10) || 0;
    return res.json({
      items, total,
      limit, offset,
      hasMore: limit > 0 && offset + items.length < total,
    });
  }
  return res.json(items);
}
