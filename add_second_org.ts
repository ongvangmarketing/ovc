import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findUnique({ where: { email: "trungongvang@gmail.com" } });
  
  if (!user) {
    console.log("User not found");
    return;
  }
  
  // Create a second organization
  const org2 = await prisma.organization.create({
    data: {
      name: "Công ty Đối Tác B",
      slug: "doi-tac-b-" + Date.now(),
      logo: "https://ui-avatars.com/api/?name=B&background=random",
    }
  });
  
  // Add user to the second organization
  await prisma.organizationMember.create({
    data: {
      userId: user.id,
      organizationId: org2.id,
      role: "CUSTOMER"
    }
  });
  
  console.log("Successfully added user to a second organization!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
