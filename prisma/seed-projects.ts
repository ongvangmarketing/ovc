export {};
require("dotenv").config();
const { db: prisma } = require("../src/lib/db");

async function main() {
  console.log("Seeding Project Data...");

  // Get the first organization or create a default one if none exists
  let org = await prisma.organization.findFirst();
  if (!org) {
    org = await prisma.organization.create({
      data: { name: "Ong Vàng Organization", slug: "ongvang" },
    });
  }

  // Get or create an admin user to act as owner/assignee
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "admin@ongvang.com.vn",
        name: "Admin",
        passwordHash: "not-needed-for-seed",
        organizationId: org.id,
      }
    });
  }

  // Create or find Company
  let company = await prisma.company.findFirst({
    where: { name: "NỘI THẤT GIA PHÚ", organizationId: org.id }
  });
  
  if (!company) {
    company = await prisma.company.create({
      data: {
        organizationId: org.id,
        name: "NỘI THẤT GIA PHÚ",
        industry: "Nội thất",
        website: "giaphu.vn",
        address: "TP.HCM"
      }
    });
  }

  // Create Project
  const project = await prisma.project.create({
    data: {
      organizationId: org.id,
      name: "Trung - NỘI THẤT GIA PHÚ",
      description: "Dự án thiết kế và thi công nội thất cho công ty Gia Phú",
      ownerId: user.id,
      color: "#f59e0b",
      status: "ACTIVE",
      taskLists: {
        create: [
          { name: "To Do", order: 0, color: "#94a3b8" },
          { name: "In Progress", order: 1, color: "#3b82f6" },
          { name: "Review", order: 2, color: "#f59e0b" },
          { name: "Done", order: 3, color: "#10b981" },
        ]
      },
      members: {
        create: [
          { userId: user.id, role: "OWNER" }
        ]
      }
    }
  });

  // Create some Tasks for the Project
  const taskLists = await prisma.taskList.findMany({ where: { projectId: project.id } });
  const todoList = taskLists.find((l: any) => l.name === "To Do")?.id;
  const inProgressList = taskLists.find((l: any) => l.name === "In Progress")?.id;

  await prisma.task.createMany({
    data: [
      {
        projectId: project.id,
        creatorId: user.id,
        assigneeId: user.id,
        taskListId: todoList,
        title: "Thiết kế UI/UX Trang chủ",
        description: "Lên layout trang chủ",
        status: "TODO",
        priority: "HIGH",
        estimatedHours: 10,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // +3 days
      },
      {
        projectId: project.id,
        creatorId: user.id,
        assigneeId: user.id,
        taskListId: todoList,
        title: "Cắt HTML/CSS Header",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        estimatedHours: 5,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      },
      {
        projectId: project.id,
        creatorId: user.id,
        assigneeId: user.id,
        taskListId: inProgressList,
        title: "Thiết lập Server & Database",
        description: "Deploy lên Vercel",
        status: "IN_PROGRESS",
        priority: "HIGH",
        estimatedHours: 8,
      }
    ]
  });

  console.log(`✅ Seeded Project "${project.name}" successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
