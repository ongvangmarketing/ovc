import { db as prisma } from "../src/lib/db";
import * as mysql from "mysql2/promise";
import { hashPassword } from "better-auth/crypto";
import "dotenv/config";

async function main() {
  console.log("Connecting to MySQL...");
  const companyDb = await mysql.createConnection({
    socketPath: "/tmp/mysql.sock",
    user: "ongvangmacbook",
    password: "", // From .env
    database: "ongvang_company",
  });
  const crmDb = await mysql.createConnection({
    socketPath: "/tmp/mysql.sock",
    user: "ongvangmacbook",
    password: "",
    database: "ongvang_crm",
  });

  console.log("Clearing existing data...");
  // Clear order matters due to foreign keys
  await prisma.activityLog.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.task.deleteMany();
  await prisma.taskList.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.contractItem.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  console.log("Fetching old users...");
  const [oldUsers] = await companyDb.query<any[]>("SELECT * FROM users");
  console.log(`Found ${oldUsers.length} users.`);

  console.log("Fetching old departments...");
  const [oldDepartments] = await companyDb.query<any[]>("SELECT * FROM departments");
  console.log(`Found ${oldDepartments.length} departments.`);

  // 1. Migrate Users
  const userMap = new Map();
  for (const oldUser of oldUsers) {
    if (!oldUser.email) continue;
    let role = "STAFF";
    if (oldUser.id === 1 || oldUser.email === "info@ongvang.com.vn") role = "SUPER_ADMIN";
    
    const password = await hashPassword("Ongvang@2026");
    
    const newUser = await prisma.user.create({
      data: {
        email: oldUser.email,
        name: oldUser.name,
        role: role,
        emailVerified: true,
        image: oldUser.avatar,
        isActive: true,
        createdAt: oldUser.created_at || new Date(),
        updatedAt: oldUser.updated_at || new Date()
      }
    });
    userMap.set(oldUser.id, newUser.id);

    await prisma.account.create({
      data: {
        userId: newUser.id,
        accountId: newUser.id,
        providerId: "credential",
        password: password
      }
    });
  }

  // 2. Create default organizations based on departments or default
  const defaultOrgId = "org_main";
  const superAdmin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } }) 
    || await prisma.user.findFirst();
  
  if (!superAdmin) throw new Error("No users migrated!");

  await prisma.organization.create({
    data: {
      id: defaultOrgId,
      name: "Ong Vàng Workspace",
      slug: "ongvang-workspace",
      isActive: true,
      ownerId: superAdmin.id
    }
  });

  // 3. Add Users to default workspace
  for (const oldUser of oldUsers) {
    if (!oldUser.email) continue;
    const newUserId = userMap.get(oldUser.id);
    if (!newUserId) continue;
    
    let role = "STAFF";
    if (oldUser.id === 1 || oldUser.email === "info@ongvang.com.vn") role = "SUPER_ADMIN";

    await prisma.organizationMember.create({
      data: {
        organizationId: defaultOrgId,
        userId: newUserId,
        role: role === "SUPER_ADMIN" ? "OWNER" : "MEMBER"
      }
    });
  }

  // 3. Migrate Customers (from CRM)
  console.log("Fetching old customers (CRM)...");
  const [oldCustomers] = await crmDb.query<any[]>("SELECT * FROM customers");
  console.log(`Found ${oldCustomers.length} customers.`);

  for (const customer of oldCustomers) {
    if (!customer.name) continue;
    
    // We create a Company and a Primary Contact for each customer
    const newCompany = await prisma.company.create({
      data: {
        organizationId: defaultOrgId,
        name: customer.company || customer.name,
        email: customer.email || null,
        phone: customer.phone || null,
        address: customer.address || null,
        website: customer.website || null,
        description: customer.notes || null,
        createdAt: customer.created_at || new Date(),
        updatedAt: customer.updated_at || new Date()
      }
    });

    // Create a contact
    await prisma.contact.create({
      data: {
        organizationId: defaultOrgId,
        companyId: newCompany.id,
        name: customer.contact_person || customer.name || "Người liên hệ",
        email: customer.email || null,
        phone: customer.phone || null,
        position: "Người liên hệ",
        createdAt: customer.created_at || new Date(),
        updatedAt: customer.updated_at || new Date()
      }
    });
  }

  // Add more migration steps here (projects, contracts, etc.) once verified.

  console.log("Migration completed for Phase 1!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
