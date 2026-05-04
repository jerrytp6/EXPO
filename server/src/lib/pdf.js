// PDF 產生 — pdfkit + CJK 字型
//
// 字型策略：
// - env PDF_CJK_FONT_PATH 設了 → 用該 ttf/otf
// - 沒設 → fallback 到 pdfkit 內建 Helvetica（中文會顯示為空白 / 缺字）
//
// 路徑慣例：server/uploads/{tenantId}/{YYYY-MM}/{uuid}-equipment-request-{id}.pdf

import PDFDocument from "pdfkit";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");
const FONT_PATH = process.env.PDF_CJK_FONT_PATH || "";
let cjkAvailable = false;
if (FONT_PATH && fs.existsSync(FONT_PATH)) {
  cjkAvailable = true;
  console.log(`[pdf] CJK font loaded: ${FONT_PATH}`);
} else if (FONT_PATH) {
  console.warn(`[pdf] PDF_CJK_FONT_PATH set but file not found: ${FONT_PATH}`);
}

function font(doc, weight = "regular") {
  if (cjkAvailable) {
    doc.font(FONT_PATH);
  } else {
    doc.font(weight === "bold" ? "Helvetica-Bold" : "Helvetica");
  }
  return doc;
}

// 產生設備申請單 PDF
// 參數：{ request, vendor, event, items: [{ name, spec, unit, qty, unitPrice, subtotal }] }
export async function generateEquipmentRequestPdf({ request, vendor, event, items }) {
  const tenantId = request.tenantId;
  const ym = new Date().toISOString().slice(0, 7);
  const dir = path.join(UPLOAD_ROOT, tenantId, ym);
  fs.mkdirSync(dir, { recursive: true });
  const id = crypto.randomBytes(6).toString("hex");
  const filename = `${id}-equipment-${request.id.slice(-6)}.pdf`;
  const outPath = path.join(dir, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);

    // 標題
    font(doc, "bold").fontSize(20).text("設備申請單 / Equipment Request Form", { align: "center" });
    doc.moveDown(0.5);
    font(doc).fontSize(10).fillColor("#666").text(`申請單號：${request.id}`, { align: "center" });
    doc.fillColor("black").moveDown(1.5);

    // 基本資訊
    const infoY = doc.y;
    font(doc, "bold").fontSize(11).text("活動：", 50, infoY);
    font(doc).text(event.name, 110, infoY);
    font(doc, "bold").text("地點：", 50, infoY + 18);
    font(doc).text(event.location || "—", 110, infoY + 18);
    font(doc, "bold").text("日期：", 50, infoY + 36);
    font(doc).text(`${event.startDate?.toISOString().slice(0, 10) || "—"} ~ ${event.endDate?.toISOString().slice(0, 10) || "—"}`, 110, infoY + 36);

    font(doc, "bold").text("廠商：", 320, infoY);
    font(doc).text(vendor.company, 370, infoY);
    font(doc, "bold").text("聯絡人：", 320, infoY + 18);
    font(doc).text(vendor.contact || "—", 380, infoY + 18);
    font(doc, "bold").text("Email：", 320, infoY + 36);
    font(doc).fontSize(9).text(vendor.email, 370, infoY + 36);

    doc.y = infoY + 70;
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#ccc").stroke();
    doc.moveDown(1);

    // 項目表頭
    const startX = 50;
    const colWidths = [200, 80, 50, 60, 90]; // 名稱 / 規格 / 數量 / 單價 / 小計
    const headers = ["項目 Name", "規格 Spec", "數量 Qty", "單價 Price", "小計 Subtotal"];

    let rowY = doc.y;
    font(doc, "bold").fontSize(10).fillColor("#fff");
    doc.rect(startX, rowY, colWidths.reduce((a, b) => a + b), 22).fill("#333");
    let cx = startX + 5;
    headers.forEach((h, i) => {
      doc.fillColor("#fff").text(h, cx, rowY + 6, { width: colWidths[i] - 10 });
      cx += colWidths[i];
    });
    rowY += 22;

    // 項目列
    font(doc).fontSize(10).fillColor("black");
    let total = 0;
    items.forEach((item, idx) => {
      if (idx % 2 === 0) {
        doc.rect(startX, rowY, colWidths.reduce((a, b) => a + b), 22).fill("#f7f7f7").fillColor("black");
      }
      cx = startX + 5;
      const cells = [
        item.name || "—",
        item.spec || "—",
        String(item.qty),
        `NT$ ${Number(item.unitPrice).toLocaleString()}`,
        `NT$ ${Number(item.subtotal).toLocaleString()}`,
      ];
      cells.forEach((c, i) => {
        font(doc).fillColor("black").text(c, cx, rowY + 6, { width: colWidths[i] - 10, ellipsis: true });
        cx += colWidths[i];
      });
      total += Number(item.subtotal);
      rowY += 22;
    });

    // 總金額
    rowY += 8;
    doc.moveTo(50, rowY).lineTo(545, rowY).strokeColor("#000").stroke();
    rowY += 10;
    font(doc, "bold").fontSize(12).text("總金額 Total：", 360, rowY);
    font(doc, "bold").text(`NT$ ${total.toLocaleString()}`, 460, rowY);

    // 簽署區
    doc.y = rowY + 60;
    font(doc).fontSize(10).fillColor("#000");
    doc.text("廠商簽章 Vendor Signature：", 50, doc.y);
    doc.moveTo(50, doc.y + 50).lineTo(280, doc.y + 50).stroke();

    doc.text("主辦方確認 Approved By：", 320, doc.y - 12);
    doc.moveTo(320, doc.y + 38).lineTo(545, doc.y + 38).stroke();

    // 頁尾
    doc.y = 760;
    font(doc).fontSize(8).fillColor("#999");
    doc.text(`產生日期 ${new Date().toISOString().slice(0, 19).replace("T", " ")}`, 50, 760);
    doc.text(`Exhibition OS · ${event.name}`, 50, 760, { align: "right" });

    doc.end();
    stream.on("finish", () => {
      resolve({
        path: outPath,
        url: `/files/${tenantId}/${ym}/${filename}`,
        filename,
      });
    });
    stream.on("error", reject);
  });
}
