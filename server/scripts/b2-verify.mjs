// B2 multi-tenant 隔離驗證 — 不經 HTTP，直接用 makeTenantClient
import "dotenv/config";
import { makeTenantClient } from "../src/lib/prisma-tenant.js";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  console.log("=== 1. company-admin (tenantId=c-1) ===");
  const tx1 = makeTenantClient("c-1", false);
  const events1 = await tx1.event.findMany();
  console.log(`  findMany events: ${events1.length} (預期 3，c-1)`);
  const vendors1 = await tx1.vendor.findMany();
  console.log(`  findMany vendors: ${vendors1.length} (預期 30)`);

  console.log("\n=== 2. portal-admin (cross-tenant) — bypass ===");
  const tx2 = makeTenantClient(null, true);
  const events2 = await tx2.event.findMany();
  console.log(`  findMany events: ${events2.length} (預期 3，全部)`);
  const tenants2 = await tx2.tenant.findMany();
  console.log(`  findMany tenants: ${tenants2.length} (預期 3，Tenant 不在 scope 名單)`);

  console.log("\n=== 3. 假租戶 c-99 ===");
  const tx3 = makeTenantClient("c-99", false);
  const events3 = await tx3.event.findMany();
  console.log(`  findMany events: ${events3.length} (預期 0)`);

  console.log("\n=== 4. create 自動補 tenantId ===");
  const tx4 = makeTenantClient("c-1", false);
  const sample = await tx4.activity.create({
    data: { action: "b2_test", at: new Date() },
  });
  console.log(`  created activity.tenantId = ${sample.tenantId} (預期 "c-1")`);
  await prisma.activity.delete({ where: { id: sample.id } });

  console.log("\n=== 5. count 自動 scope ===");
  const tx5 = makeTenantClient("c-1", false);
  const cnt1 = await tx5.formSubmission.count();
  console.log(`  count formSubs (c-1): ${cnt1} (預期 22)`);
  const cnt99 = await makeTenantClient("c-99", false).formSubmission.count();
  console.log(`  count formSubs (c-99): ${cnt99} (預期 0)`);

  console.log("\n=== 6. 跨租戶 explicit tenant 切換視角 ===");
  const tx6 = makeTenantClient("c-1", true);
  const events6 = await tx6.event.findMany();
  console.log(`  findMany events: ${events6.length} (預期 3，super-admin 切到 c-1)`);

  await prisma.$disconnect();
  console.log("\n--- DONE ---");
}

main().catch((e) => { console.error(e); process.exit(1); });
