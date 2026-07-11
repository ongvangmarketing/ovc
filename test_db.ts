import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const users = await prisma.user.findMany({ take: 3 })
  console.log(users.map(u => ({ id: u.id, name: u.name, org: u.organizationId })))
}
main().catch(console.error).finally(() => prisma.$disconnect())
