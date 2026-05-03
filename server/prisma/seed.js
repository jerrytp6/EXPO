// Phase A1 最小 seed：1 個租戶 + 5 個各角色帳號（密碼一律 demo1234）
// Phase B1 會把 src/lib/seed.js 全部資料補進來。
import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 10);

  // 租戶
  const tenant = await prisma.tenant.upsert({
    where: { id: "c-1" },
    update: {},
    create: {
      id: "c-1",
      name: "群揚資通股份有限公司",
      taxId: "12345678",
      industry: "資訊服務業",
      size: "100–500 人",
      address: "台北市內湖區瑞光路 168 號",
      phone: "02-2345-6789",
      status: "active",
      externalId: "portal-tenant-c-1",
    },
  });

  const users = [
    { id: "u-pa-1", email: "portal@exhibitos.com", name: "Portal 超管",   role: "portal-admin",   tenantId: null,      title: "展會營運平台 · 業務管理" },
    { id: "u-sa-1", email: "admin@exhibitos.com",  name: "平台維運",     role: "super-admin",    tenantId: null,      title: "EX 系統技術維運" },
    { id: "u-ca-1", email: "ming@agcnet.com.tw",   name: "陳小明",       role: "company-admin",  tenantId: tenant.id, title: "資訊長 CIO" },
    { id: "u-em-1", email: "yating@agcnet.com.tw", name: "林雅婷",       role: "event-manager",  tenantId: tenant.id, title: "行銷部主任" },
    { id: "u-mb-1", email: "meiling@agcnet.com.tw",name: "王美玲",       role: "member",         tenantId: tenant.id, title: "客服專員" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: { email: u.email, name: u.name, role: u.role, tenantId: u.tenantId, title: u.title },
      create: { ...u, passwordHash },
    });
  }

  console.log(`✓ Seeded tenant: ${tenant.name}`);
  console.log(`✓ Seeded ${users.length} users (default password: demo1234)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
