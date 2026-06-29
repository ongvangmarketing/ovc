require("dotenv").config();
const { db } = require("../../src/lib/db");

async function main() {
  console.log("Seeding Education & Portal Demo Data (Phase 3)...");

  const orgA = await db.organization.findFirst({
    where: { name: { contains: "Công ty A" } },
  });

  const admin = await db.user.findFirst({ where: { email: "info@ovc.vn" } });

  if (!orgA || !admin) {
    throw new Error("Công ty A or Admin not found!");
  }

  const orgId = orgA.id;
  const adminId = admin.id;

  // 1. Create or find Instructor user (upsert by email)
  let instructor = await db.user.findFirst({ where: { email: "training@ovc.vn" } });
  if (!instructor) {
    const { hashPassword } = require("better-auth/crypto");
    const hashedPwd = await hashPassword("Training@2026");
    instructor = await db.user.create({
      data: {
        name: "Giảng viên Ong Vàng",
        email: "training@ovc.vn",
        emailVerified: true,
        role: "ADMIN",
        password: hashedPwd
      }
    });
    // Add to org
    await db.organizationMember.create({
      data: {
        userId: instructor.id,
        organizationId: orgId,
        role: "MEMBER"
      }
    });
    console.log("Instructor user created.");
  } else {
    console.log("Instructor user already exists.");
  }

  // 2. Create or find Student user
  let student = await db.user.findFirst({ where: { email: "hocvien@abc.com" } });
  if (!student) {
    const { hashPassword } = require("better-auth/crypto");
    const hashedPwd = await hashPassword("Hocvien@2026");
    student = await db.user.create({
      data: {
        name: "Học viên Demo",
        email: "hocvien@abc.com",
        emailVerified: true,
        role: "CUSTOMER"
      }
    });
    // better-auth stores password in the Account table
    await db.account.create({
      data: {
        userId: student.id,
        accountId: student.id,
        providerId: "credential",
        password: hashedPwd
      }
    });
    await db.organizationMember.create({
      data: {
        userId: student.id,
        organizationId: orgId,
        role: "MEMBER"
      }
    });
    console.log("Student user created.");
  } else {
    console.log("Student user already exists.");
  }

  // 3. Create Course
  await db.course.deleteMany({ where: { slug: "crm-foundation-2026" } });
  const course = await db.course.create({
    data: {
      organizationId: orgId,
      instructorId: instructor.id,
      title: "CRM Foundation – Nền tảng Quản lý Khách hàng",
      slug: "crm-foundation-2026",
      description: "Khóa học giúp bạn nắm vững quy trình CRM từ Lead đến hợp đồng, hóa đơn và chăm sóc sau bán.",
      status: "PUBLISHED",
      price: 2990000,
      level: "beginner",
      language: "vi"
    }
  });

  // 4. Create Section & Lessons
  const section = await db.courseSection.create({
    data: {
      courseId: course.id,
      title: "Chương 1: Tổng quan CRM",
      order: 0
    }
  });

  await db.lesson.create({
    data: {
      sectionId: section.id,
      title: "Bài 1: CRM là gì? Tại sao cần CRM?",
      order: 0,
      type: "VIDEO",
      duration: 15,
      isFree: true
    }
  });

  await db.lesson.create({
    data: {
      sectionId: section.id,
      title: "Bài 2: Quy trình Lead → Hợp đồng",
      order: 1,
      type: "VIDEO",
      duration: 25,
      isFree: false
    }
  });
  console.log("Course and Lessons created.");

  // 5. Create Class
  const classObj = await db.class.create({
    data: {
      courseId: course.id,
      name: "Lớp K01-2026",
      code: "CRM-K01-2026",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      maxStudents: 20,
      isActive: true
    }
  });

  // 6. Enroll Student
  await db.enrollment.create({
    data: {
      courseId: course.id,
      classId: classObj.id,
      studentId: student.id,
      status: "ACTIVE",
      progress: 50,
      startedAt: new Date()
    }
  });
  console.log("Class and Enrollment created.");

  // 7. Portal: Link Customer to Project via Contact
  // The customer contact is already linked to the project via contactId in Phase 2.
  // Find the project and show its info.
  const project = await db.project.findFirst({
    where: { name: "Triển khai CRM cho Tập đoàn ABC" }
  });

  if (project) {
    console.log(`Portal link ready: Project "${project.name}" is linked to customer contact.`);
  }

  console.log("Education & Portal Demo (Phase 3) Seeding Complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
