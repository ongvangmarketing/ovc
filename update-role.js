const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
async function main() {
  await prisma.user.update({
    where: { email: 'admin@ongvang.com' },
    data: { role: 'ADMIN' },
  });
  console.log('Role updated to ADMIN');
}
main().catch(console.error).finally(() => prisma.$disconnect());
