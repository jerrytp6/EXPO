// 寄信 service
//
// 規則：
// - dev：env SMTP_DEV_HOST 設了就走 Mailhog (本地 :1025) — 不需 auth
// - prod：依 tenantId 從 smtp_settings 表讀取設定
//   * 真實密碼：secret store / env SMTP_PASSWORD_<tenantId>，passwordMasked 欄位只是 UI 顯示
//
// 寄信策略：
// - 不阻塞主流程：寄信失敗只 console.warn，不 throw（避免主流程 rollback）
// - 模板渲染：簡易 {{var}} / {{nested.path}} 替換
// - 模板查找：先找 event-scoped，再 fallback 到 tenant-scoped

import nodemailer from "nodemailer";
import { prisma } from "./prisma.js";

const transports = new Map(); // tenantId | "_dev" → transporter

function isDev() {
  return !!process.env.SMTP_DEV_HOST;
}

async function getTransport(tenantId) {
  if (isDev()) {
    if (!transports.has("_dev")) {
      transports.set("_dev", nodemailer.createTransport({
        host: process.env.SMTP_DEV_HOST,
        port: parseInt(process.env.SMTP_DEV_PORT || "1025", 10),
        secure: false,
        ignoreTLS: true,
      }));
    }
    return transports.get("_dev");
  }
  if (transports.has(tenantId)) return transports.get(tenantId);
  const smtp = await prisma.smtpSetting.findUnique({ where: { tenantId } });
  if (!smtp) throw Object.assign(new Error("smtp_not_configured"), { statusCode: 412 });
  const password = process.env[`SMTP_PASSWORD_${tenantId}`] || "";
  const t = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.username, pass: password },
  });
  transports.set(tenantId, t);
  return t;
}

async function getFromAddress(tenantId) {
  if (isDev()) return process.env.SMTP_DEV_FROM || "EX dev <noreply@ex.local>";
  const smtp = await prisma.smtpSetting.findUnique({ where: { tenantId } });
  if (!smtp) return "EX <noreply@ex.local>";
  return `"${smtp.fromName}" <${smtp.fromEmail}>`;
}

// 簡易模板渲染：{{vendor.name}} / {{event.name}} / {{invite_url}}
export function renderTemplate(template, vars) {
  if (!template) return "";
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const path = key.split(".");
    let v = vars;
    for (const p of path) v = v?.[p];
    return v == null ? "" : String(v);
  });
}

// 寫 email_log（不阻塞主流程，失敗只 console.warn）
async function writeLog({ tenantId, eventId, vendorId, trigger, to, subject, status, error, messageId }) {
  try {
    await prisma.emailLog.create({
      data: {
        tenantId: tenantId === "_system" ? null : (tenantId || null),
        eventId: eventId || null,
        vendorId: vendorId || null,
        trigger: trigger || null,
        toAddress: to || "",
        subject: subject || "",
        status,
        error: error || null,
        messageId: messageId || null,
      },
    });
  } catch (err) {
    console.warn("[mailer] failed to write email_log:", err.message);
  }
}

// 直接寄信
export async function sendMail({ tenantId, to, subject, html, text, replyTo, eventId, vendorId, trigger }) {
  if (!to) {
    console.warn("[mailer] sendMail: no recipient");
    await writeLog({ tenantId, eventId, vendorId, trigger, to, subject, status: "failed", error: "no_recipient" });
    return { sent: false, reason: "no_recipient" };
  }
  try {
    const t = await getTransport(tenantId);
    const from = await getFromAddress(tenantId);
    const info = await t.sendMail({
      from,
      to,
      subject,
      html: html || text,
      text: text || (html ? html.replace(/<[^>]+>/g, "") : ""),
      replyTo,
    });
    await writeLog({ tenantId, eventId, vendorId, trigger, to, subject, status: "sent", messageId: info.messageId });
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.warn(`[mailer] failed to send to ${to}:`, err.message);
    await writeLog({ tenantId, eventId, vendorId, trigger, to, subject, status: "failed", error: err.message });
    return { sent: false, reason: err.message };
  }
}

// 內建 fallback 模板（找不到使用者自訂模板時用）
const BUILTIN = {
  password_reset: {
    subject: "【EX 系統】重設您的密碼",
    body: "<p>{{user.name}} 您好，</p><p>我們收到您的密碼重設請求。請點擊下方連結設定新密碼（{{ttl}}內有效）：</p><p><a href=\"{{reset_url}}\">{{reset_url}}</a></p><p>如非本人請忽略此信，您的密碼不會被變動。</p>",
  },
  vendor_confirmed: {
    subject: "【{{event.name}}】您已確認加入參展名單",
    body: "<p>{{vendor.contact}} 您好，</p><p>{{vendor.company}} 已正式確認參與「{{event.name}}」（{{event.location}}）。</p><p>請登入廠商入口完成後續資料：<a href=\"{{portal_url}}\">{{portal_url}}</a></p>",
  },
  equipment_approved: {
    subject: "【{{event.name}}】設備申請審核通過",
    body: "<p>{{vendor.contact}} 您好，</p><p>您提交的設備申請（總金額 NT$ {{amount}}）已審核通過。</p><p>請依時程繳交費用並完成簽署。</p><p>{{portal_url}}</p>",
  },
  equipment_rejected: {
    subject: "【{{event.name}}】設備申請需要修正",
    body: "<p>{{vendor.contact}} 您好，</p><p>您提交的設備申請被退回，原因：</p><blockquote>{{feedback}}</blockquote><p>請登入修改後重新提交：{{portal_url}}</p>",
  },
};

// 用 trigger 找模板再寄
export async function sendByTrigger({ tenantId, eventId, trigger, to, vars = {} }) {
  let tpl = null;
  if (eventId) {
    tpl = await prisma.emailTemplate.findFirst({
      where: { tenantId, scope: "event", eventId, trigger },
    });
  }
  if (!tpl) {
    tpl = await prisma.emailTemplate.findFirst({
      where: { tenantId, scope: "tenant", trigger },
    });
  }
  let subject, html;
  if (tpl) {
    subject = renderTemplate(tpl.subject, vars);
    html = renderTemplate(tpl.body, vars);
  } else if (BUILTIN[trigger]) {
    subject = renderTemplate(BUILTIN[trigger].subject, vars);
    html = renderTemplate(BUILTIN[trigger].body, vars);
  } else {
    console.warn(`[mailer] no template for trigger=${trigger}`);
    await prisma.emailLog.create({
      data: {
        tenantId: tenantId === "_system" ? null : (tenantId || null),
        eventId: eventId || null,
        trigger,
        toAddress: to || "",
        subject: "",
        status: "no_template",
      },
    }).catch(() => {});
    return { sent: false, reason: "no_template" };
  }
  return sendMail({ tenantId, to, subject, html, eventId, trigger, vendorId: vars.vendor?.id });
}

// SMTP 連線測試（取代寫死 success）
export async function verifySmtp(tenantId) {
  try {
    const t = await getTransport(tenantId);
    await t.verify();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// 給觸發點建構 URL（邀請連結等）
export function appUrl(path) {
  const base = process.env.APP_BASE_URL || "http://localhost:5173/EXPO";
  return `${base}/#${path.startsWith("/") ? path : "/" + path}`;
}
