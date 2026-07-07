import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({ where: { email: "trungongvang@gmail.com" } });
  console.log("User:", user?.id, user?.email);
  
  if (user) {
    const projects = await prisma.project.findMany({
      where: { customerId: user.id }
    });
    console.log("Projects for user:", projects.map(p => ({ id: p.id, title: p.title, org: p.organizationId })));
    
    const orgs = await prisma.organizationMember.findMany({
      where: { userId: user.id },
      include: { organization: true }
    });
    console.log("Orgs for user:", orgs.map(o => ({ id: o.organizationId, role: o.role })));
  }
}
check().finally(() => prisma.$disconnect());
