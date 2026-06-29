const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const org = await prisma.organization.findFirst();
  const admin = await prisma.user.findFirst({ where: { email: 'admin@ongvang.com' } });
  const companies = await prisma.company.findMany();
  
  if (!org || !admin || companies.length < 2) return console.log("Missing prerequisites");
  
  const stage1 = await prisma.dealStage.create({ data: { organizationId: org.id, name: "Lead", color: "#94A3B8", position: 0 } });
  const stage2 = await prisma.dealStage.create({ data: { organizationId: org.id, name: "Đã liên hệ", color: "#3B82F6", position: 1 } });
  
  await prisma.deal.create({
    data: { organizationId: org.id, title: "Website Redesign", value: 50000000, stageId: stage1.id, companyId: companies[0].id, assigneeId: admin.id, priority: "HIGH" }
  });
  await prisma.deal.create({
    data: { organizationId: org.id, title: "ERP Integration", value: 200000000, stageId: stage2.id, companyId: companies[1].id, assigneeId: admin.id, priority: "URGENT" }
  });
  console.log("Seeded deals.");
}
main().then(() => prisma.$disconnect());
