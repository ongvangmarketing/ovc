require("dotenv").config();
const { db } = require("./src/lib/db");

async function main() {
  const orgA = await db.organization.findFirst({ where: { name: { contains: "Công ty A" } } });
  const orgOngVang = await db.organization.findFirst({ where: { name: { contains: "Ong Vàng Workspace" } } });

  if (orgA && orgOngVang) {
    // Move all contacts
    await db.contact.updateMany({
      where: { organizationId: orgOngVang.id },
      data: { organizationId: orgA.id }
    });
    // Move all projects
    await db.project.updateMany({
      where: { organizationId: orgOngVang.id },
      data: { organizationId: orgA.id }
    });
    // Move all deals
    await db.deal.updateMany({
      where: { organizationId: orgOngVang.id },
      data: { organizationId: orgA.id }
    });
    // Move all invoices
    await db.invoice.updateMany({
      where: { organizationId: orgOngVang.id },
      data: { organizationId: orgA.id }
    });
    // Move activities
    await db.activity.updateMany({
      where: { organizationId: orgOngVang.id },
      data: { organizationId: orgA.id }
    });
    console.log("Moved all data to Công ty A!");
  }
}
main().finally(() => db.$disconnect());
