// CSV 匯出 helper
//
// 用法：
//   const csv = await rowsToCsv(rows, columns);
//   sendCsv(res, "vendors_2026-05.csv", csv);
//
// columns: [{ key: "company", header: "公司名稱" }, ...]
//   key 可為 "x.y.z" 取巢狀；或 (row) => 任意值

import { stringify } from "csv-stringify/sync";

const BOM = "﻿"; // Excel 才會正確識別 UTF-8

function pickValue(row, key) {
  if (typeof key === "function") return key(row);
  return key.split(".").reduce((v, k) => (v == null ? null : v[k]), row);
}

export function rowsToCsv(rows, columns) {
  const header = columns.map((c) => c.header || c.key);
  const data = rows.map((r) => columns.map((c) => {
    const v = pickValue(r, c.key);
    if (v == null) return "";
    if (typeof v === "boolean") return v ? "是" : "否";
    if (v instanceof Date) return v.toISOString().slice(0, 19).replace("T", " ");
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  }));
  return stringify([header, ...data]);
}

export function sendCsv(res, filename, csvBody) {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
  res.send(BOM + csvBody);
}
