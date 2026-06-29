require("dotenv").config();
const { db: prisma } = require("../src/lib/db");
const bcrypt = require("bcryptjs");

async function main() {
  console.log("Seeding Users Data...");

  const users = [
    { email: "info@ovc.vn", name: "Super Admin", role: "SUPER_ADMIN" },
    { email: "trung@ovc.vn", name: "Trung Manager", role: "MANAGER" },
    { email: "marketing@ovc.vn", name: "Marketing OVC", role: "CUSTOMER" },
    { email: "training@ovc.vn", name: "Training OVC", role: "INSTRUCTOR" },
    { email: "trungongvang@gmail.com", name: "Trung Ong Vang", role: "CUSTOMER" },
  ];

  const rawPassword = "Ongvang@2026";
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  for (const u of users) {
    let user = await prisma.user.findUnique({
      where: { email: u.email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          role: u.role,
          emailVerified: true,
        }
      });
      console.log(`Created user: ${user.email} (Role: ${user.role})`);
    } else {
      user = await prisma.user.update({
        where: { email: u.email },
        data: { role: u.role }
      });
      console.log(`Updated user: ${user.email} (Role: ${user.role})`);
    }

    // Check if account exists
    let account = await prisma.account.findFirst({
      where: { userId: user.id, providerId: "credential" }
    });

    if (!account) {
      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: user.id,
          providerId: "credential",
          password: hashedPassword,
        }
      });
      console.log(`Created credentials account for: ${user.email}`);
    } else {
      await prisma.account.update({
        where: { id: account.id },
        data: { password: hashedPassword }
      });
      console.log(`Updated credentials password for: ${user.email}`);
    }
  }

  console.log("✅ Seeded Users successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
