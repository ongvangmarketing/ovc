export {};
require("dotenv").config();
const { db: prisma } = require("../src/lib/db");

async function main() {
  console.log("Seeding Company Data...");

  let org = await prisma.organization.findFirst();
  if (!org) {
    org = await prisma.organization.create({
      data: { name: "Ong Vàng Organization", slug: "ongvang" },
    });
  }

  // Create or update Company AN THỊNH PHAN THIẾT
  let company = await prisma.company.findFirst({
    where: { name: "AN THỊNH PHAN THIẾT", organizationId: org.id }
  });
  
  if (!company) {
    company = await prisma.company.create({
      data: {
        organizationId: org.id,
        name: "AN THỊNH PHAN THIẾT",
        phone: "0909123456",
        website: "anthinhphanthiet.vn",
        address: "123 Đường ABC",
        city: "Phan Thiết",
        country: "Vietnam"
      }
    });
  } else {
    company = await prisma.company.update({
      where: { id: company.id },
      data: {
        phone: "0909123456",
        website: "anthinhphanthiet.vn",
        address: "123 Đường ABC",
        city: "Phan Thiết",
        country: "Vietnam"
      }
    });
  }

  // Create a Contact for this Company so the count shows 1
  let contact = await prisma.contact.findFirst({
    where: { companyId: company.id }
  });

  if (!contact) {
    await prisma.contact.create({
      data: {
        organizationId: org.id,
        companyId: company.id,
        name: "Nguyễn Văn A",
        email: "nguyenvana@anthinhphanthiet.vn",
        phone: "0909123456"
      }
    });
  }

  console.log(`✅ Seeded Company "${company.name}" successfully! ID: ${company.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
