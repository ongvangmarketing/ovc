import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import crypto from "node:crypto";

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || ".env.local" });

const prisma = new PrismaClient();
const email = "marketing@ovc.vn";
const password = "Ongvang@26041211";

async function main() {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log(JSON.stringify({ ok: false, reason: "missing_user", email }));
    process.exit(1);
  }

  const hashedPassword = await hashPassword(password);

  const account = await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "credential",
        accountId: user.id,
      },
    },
    update: {
      password: hashedPassword,
      updatedAt: new Date(),
    },
    create: {
      id: crypto.randomUUID(),
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const passwordOk = await verifyPassword({ hash: account.password || "", password });

  console.log(JSON.stringify({
    ok: true,
    email: user.email,
    role: user.role,
    userId: user.id,
    accountId: account.id,
    passwordOk,
  }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
