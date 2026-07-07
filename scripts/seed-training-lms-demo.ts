import "dotenv/config";

import { hashPassword } from "better-auth/crypto";
import { Prisma, PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const DEMO_PASSWORD = "Ongvang@2026";
const now = new Date();
const day = 24 * 60 * 60 * 1000;

function addDays(days: number, hour = 9, minute = 0) {
  const date = new Date(now.getTime() + days * day);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function getOrganization() {
  const slug = process.env.TARGET_ORGANIZATION_SLUG || "ong-vang";
  const organization =
    (await prisma.organization.findUnique({ where: { slug } })) ||
    (await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } }));

  if (!organization) throw new Error("Không tìm thấy organization để seed training.");
  return organization;
}

async function ensureUser(email: string, name: string, role: UserRole, organizationId: string, phone?: string) {
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role,
      phone,
      emailVerified: true,
      isActive: true,
      onboarded: true,
    },
    create: {
      email,
      name,
      role,
      phone,
      emailVerified: true,
      isActive: true,
      onboarded: true,
    },
  });

  await prisma.account.upsert({
    where: { providerId_accountId: { providerId: "credential", accountId: user.id } },
    update: { password: await hashPassword(DEMO_PASSWORD) },
    create: {
      userId: user.id,
      accountId: user.id,
      providerId: "credential",
      password: await hashPassword(DEMO_PASSWORD),
    },
  });

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId, userId: user.id } },
    update: { role: role === UserRole.INSTRUCTOR ? "ADMIN" : "MEMBER" },
    create: { organizationId, userId: user.id, role: role === UserRole.INSTRUCTOR ? "ADMIN" : "MEMBER" },
  });

  return user;
}

async function main() {
  const organization = await getOrganization();
  const instructor = await ensureUser(
    "training@ovc.vn",
    "OVC Training Instructor",
    UserRole.INSTRUCTOR,
    organization.id,
    "0918 320 331",
  );
  const primaryStudent = await ensureUser(
    "ongvangtraining@gmail.com",
    "Học viên Ong Vàng Training",
    UserRole.STUDENT,
    organization.id,
    "0909 202 626",
  );

  const supportStudents = await Promise.all([
    ensureUser("hocvien.demo01@ovc.vn", "Nguyễn Minh Anh", UserRole.STUDENT, organization.id, "0901 111 001"),
    ensureUser("hocvien.demo02@ovc.vn", "Lê Hoàng Gia", UserRole.STUDENT, organization.id, "0901 111 002"),
    ensureUser("hocvien.demo03@ovc.vn", "Trần Thu Hà", UserRole.STUDENT, organization.id, "0901 111 003"),
  ]);

  const course = await prisma.course.upsert({
    where: { organizationId_slug: { organizationId: organization.id, slug: "ovc-elearning-sales-crm-2026" } },
    update: {
      instructorId: instructor.id,
      title: "OVC eLearning: Sales CRM & Automation",
      description: "Khóa học online thực chiến về Lead, CRM, báo giá, hóa đơn, tự động hóa chăm sóc và dashboard vận hành.",
      thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978",
      status: "PUBLISHED",
      price: new Prisma.Decimal(3500000),
      currency: "VND",
      level: "intermediate",
      duration: 420,
      tags: ["CRM", "Sales", "Automation", "eLearning"],
      requirements: ["Biết quy trình bán hàng cơ bản", "Có tài khoản workspace OVC"],
      outcomes: [
        "Thiết kế pipeline bán hàng rõ ràng",
        "Tạo báo giá và hóa đơn từ dữ liệu CRM",
        "Theo dõi học tập qua dashboard eLearning",
        "Tự động hóa nhắc việc và chăm sóc khách hàng",
      ],
      isPublic: true,
      isFeatured: true,
      publishedAt: now,
    },
    create: {
      organizationId: organization.id,
      instructorId: instructor.id,
      title: "OVC eLearning: Sales CRM & Automation",
      slug: "ovc-elearning-sales-crm-2026",
      description: "Khóa học online thực chiến về Lead, CRM, báo giá, hóa đơn, tự động hóa chăm sóc và dashboard vận hành.",
      thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978",
      status: "PUBLISHED",
      price: new Prisma.Decimal(3500000),
      currency: "VND",
      level: "intermediate",
      duration: 420,
      tags: ["CRM", "Sales", "Automation", "eLearning"],
      requirements: ["Biết quy trình bán hàng cơ bản", "Có tài khoản workspace OVC"],
      outcomes: [
        "Thiết kế pipeline bán hàng rõ ràng",
        "Tạo báo giá và hóa đơn từ dữ liệu CRM",
        "Theo dõi học tập qua dashboard eLearning",
        "Tự động hóa nhắc việc và chăm sóc khách hàng",
      ],
      isPublic: true,
      isFeatured: true,
      publishedAt: now,
    },
  });

  const sections = [
    {
      title: "Nền tảng vận hành CRM",
      description: "Nắm quy trình Lead → Khách hàng → Deal → Báo giá.",
      order: 1,
      lessons: [
        {
          title: "Tổng quan hệ thống CRM OVC",
          type: "VIDEO" as const,
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          duration: 18,
          isFree: true,
        },
        {
          title: "Thiết kế pipeline và chăm sóc Lead",
          type: "VIDEO" as const,
          videoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
          duration: 24,
          isFree: false,
        },
      ],
    },
    {
      title: "Tài chính trong eLearning",
      description: "Tạo học phí, hóa đơn học phí và theo dõi thanh toán.",
      order: 2,
      lessons: [
        {
          title: "Từ lớp học sang học phí và hóa đơn",
          type: "LIVE" as const,
          videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
          duration: 45,
          isFree: false,
        },
        {
          title: "Bài tập: Xây dựng workflow chăm sóc học viên",
          type: "ASSIGNMENT" as const,
          videoUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
          duration: 30,
          isFree: false,
        },
      ],
    },
  ];

  const lessonIds: string[] = [];
  let firstLessonId = "";
  let assignmentLessonId = "";

  for (const sectionSeed of sections) {
    const section = await prisma.courseSection.upsert({
      where: { id: `seed-lms-section-${course.id}-${sectionSeed.order}` },
      update: {
        title: sectionSeed.title,
        description: sectionSeed.description,
        order: sectionSeed.order,
      },
      create: {
        id: `seed-lms-section-${course.id}-${sectionSeed.order}`,
        courseId: course.id,
        title: sectionSeed.title,
        description: sectionSeed.description,
        order: sectionSeed.order,
      },
    });

    for (const [index, lessonSeed] of sectionSeed.lessons.entries()) {
      const lessonOrder = (sectionSeed.order - 1) * 10 + index + 1;
      const lesson = await prisma.lesson.upsert({
        where: { id: `seed-lms-lesson-${course.id}-${lessonOrder}` },
        update: {
          title: lessonSeed.title,
          type: lessonSeed.type,
          videoUrl: lessonSeed.videoUrl,
          duration: lessonSeed.duration,
          order: lessonOrder,
          isFree: lessonSeed.isFree,
          isPublished: true,
          content: `Nội dung bài học ${lessonSeed.title}. Link YouTube được dùng cho phần học online.`,
          resources: [
            "https://docs.google.com/document/d/ovc-elearning-outline",
            "https://drive.google.com/drive/folders/ovc-training-resources",
          ],
        },
        create: {
          id: `seed-lms-lesson-${course.id}-${lessonOrder}`,
          sectionId: section.id,
          title: lessonSeed.title,
          type: lessonSeed.type,
          videoUrl: lessonSeed.videoUrl,
          duration: lessonSeed.duration,
          order: lessonOrder,
          isFree: lessonSeed.isFree,
          isPublished: true,
          content: `Nội dung bài học ${lessonSeed.title}. Link YouTube được dùng cho phần học online.`,
          resources: [
            "https://docs.google.com/document/d/ovc-elearning-outline",
            "https://drive.google.com/drive/folders/ovc-training-resources",
          ],
        },
      });

      if (!firstLessonId) firstLessonId = lesson.id;
      if (lessonSeed.type === "ASSIGNMENT") assignmentLessonId = lesson.id;
      lessonIds.push(lesson.id);
    }
  }

  const classObj = await prisma.class.upsert({
    where: { id: `seed-lms-class-${course.id}` },
    update: {
      name: "Lớp OVC CRM Online K07/2026",
      code: "OVC-CRM-K07-2026",
      startDate: addDays(1, 19),
      endDate: addDays(45, 21),
      schedule: { repeat: "weekly", days: ["Tue", "Thu"], time: "19:00-21:00" },
      location: "Online qua Google Meet",
      maxStudents: 35,
      isActive: true,
    },
    create: {
      id: `seed-lms-class-${course.id}`,
      courseId: course.id,
      name: "Lớp OVC CRM Online K07/2026",
      code: "OVC-CRM-K07-2026",
      startDate: addDays(1, 19),
      endDate: addDays(45, 21),
      schedule: { repeat: "weekly", days: ["Tue", "Thu"], time: "19:00-21:00" },
      location: "Online qua Google Meet",
      maxStudents: 35,
      isActive: true,
    },
  });

  for (const [index, lessonId] of lessonIds.entries()) {
    await prisma.lessonSchedule.upsert({
      where: { id: `seed-lms-schedule-${course.id}-${index + 1}` },
      update: {
        lessonId,
        classId: classObj.id,
        title: `Buổi ${index + 1}: ${sections.flatMap((item) => item.lessons)[index]?.title}`,
        mode: index === 2 ? "HYBRID" : "ONLINE",
        startsAt: addDays(index * 3 + 1, 19),
        endsAt: addDays(index * 3 + 1, 21),
        location: "Phòng học online OVC",
        onlineUrl: "https://meet.google.com/ovc-training-demo",
        fieldAddress: index === 2 ? "OVC Training Lab, Phan Thiết" : null,
        instructorId: instructor.id,
        capacity: 35,
        note: "Lịch demo được seed cho dashboard eLearning.",
      },
      create: {
        id: `seed-lms-schedule-${course.id}-${index + 1}`,
        lessonId,
        classId: classObj.id,
        title: `Buổi ${index + 1}: ${sections.flatMap((item) => item.lessons)[index]?.title}`,
        mode: index === 2 ? "HYBRID" : "ONLINE",
        startsAt: addDays(index * 3 + 1, 19),
        endsAt: addDays(index * 3 + 1, 21),
        location: "Phòng học online OVC",
        onlineUrl: "https://meet.google.com/ovc-training-demo",
        fieldAddress: index === 2 ? "OVC Training Lab, Phan Thiết" : null,
        instructorId: instructor.id,
        capacity: 35,
        note: "Lịch demo được seed cho dashboard eLearning.",
      },
    });
  }

  const students = [primaryStudent, ...supportStudents];

  for (const [index, student] of students.entries()) {
    const progress = [50, 75, 25, 10][index] ?? 0;
    const paidAmount = [1500000, 3500000, 1000000, 0][index] ?? 0;
    const enrollment = await prisma.enrollment.upsert({
      where: { courseId_studentId: { courseId: course.id, studentId: student.id } },
      update: {
        classId: classObj.id,
        status: "ACTIVE",
        progress,
        tuitionFee: new Prisma.Decimal(3500000),
        paidAmount: new Prisma.Decimal(paidAmount),
        paymentStatus: paidAmount >= 3500000 ? "paid" : paidAmount > 0 ? "partial" : "unpaid",
        paymentNote: "Học phí demo LMS tự động đồng bộ qua tài chính.",
        startedAt: addDays(-7),
      },
      create: {
        courseId: course.id,
        classId: classObj.id,
        studentId: student.id,
        status: "ACTIVE",
        progress,
        tuitionFee: new Prisma.Decimal(3500000),
        paidAmount: new Prisma.Decimal(paidAmount),
        paymentStatus: paidAmount >= 3500000 ? "paid" : paidAmount > 0 ? "partial" : "unpaid",
        paymentNote: "Học phí demo LMS tự động đồng bộ qua tài chính.",
        startedAt: addDays(-7),
      },
    });

    const completedLessonCount = Math.min(lessonIds.length, Math.floor((progress / 100) * lessonIds.length));
    for (const lessonId of lessonIds.slice(0, completedLessonCount)) {
      await prisma.lessonCompletion.upsert({
        where: { lessonId_enrollmentId: { lessonId, enrollmentId: enrollment.id } },
        update: { completedAt: addDays(-index - 1) },
        create: { lessonId, enrollmentId: enrollment.id, completedAt: addDays(-index - 1) },
      });
    }

    await prisma.attendance.upsert({
      where: { classId_studentId_date: { classId: classObj.id, studentId: student.id, date: addDays(-2, 19) } },
      update: { present: index !== 3, note: index === 3 ? "Vắng có phép" : "Tham gia đầy đủ" },
      create: { classId: classObj.id, studentId: student.id, date: addDays(-2, 19), present: index !== 3, note: index === 3 ? "Vắng có phép" : "Tham gia đầy đủ" },
    });
  }

  const assignment = await prisma.assignment.upsert({
    where: { id: `seed-lms-assignment-${course.id}` },
    update: {
      lessonId: assignmentLessonId || firstLessonId,
      title: "Bài tập cuối chương: Thiết kế pipeline học viên",
      description: "Nộp mô hình pipeline từ Lead/Học viên tiềm năng đến Học phí và dashboard theo dõi.",
      dueDate: addDays(7, 23, 59),
      maxScore: 100,
    },
    create: {
      id: `seed-lms-assignment-${course.id}`,
      lessonId: assignmentLessonId || firstLessonId,
      title: "Bài tập cuối chương: Thiết kế pipeline học viên",
      description: "Nộp mô hình pipeline từ Lead/Học viên tiềm năng đến Học phí và dashboard theo dõi.",
      dueDate: addDays(7, 23, 59),
      maxScore: 100,
    },
  });

  await prisma.assignmentSubmission.upsert({
    where: { assignmentId_studentId: { assignmentId: assignment.id, studentId: primaryStudent.id } },
    update: {
      content: "Em đã dựng pipeline Lead → Học viên → Lớp → Học phí, có kèm checklist tự động hóa.",
      fileUrl: "https://drive.google.com/file/d/ovc-student-assignment-demo",
      score: 86,
      feedback: "Bài làm tốt, cần bổ sung bước nhắc thanh toán học phí.",
      graderId: instructor.id,
      submittedAt: addDays(-1, 22),
      gradedAt: addDays(0, 10),
    },
    create: {
      assignmentId: assignment.id,
      studentId: primaryStudent.id,
      graderId: instructor.id,
      content: "Em đã dựng pipeline Lead → Học viên → Lớp → Học phí, có kèm checklist tự động hóa.",
      fileUrl: "https://drive.google.com/file/d/ovc-student-assignment-demo",
      score: 86,
      feedback: "Bài làm tốt, cần bổ sung bước nhắc thanh toán học phí.",
      submittedAt: addDays(-1, 22),
      gradedAt: addDays(0, 10),
    },
  });

  await prisma.assignmentSubmission.upsert({
    where: { assignmentId_studentId: { assignmentId: assignment.id, studentId: supportStudents[0].id } },
    update: {
      content: "Bài nộp đang chờ giảng viên góp ý.",
      fileUrl: "https://drive.google.com/file/d/ovc-pending-assignment-demo",
      score: null,
      feedback: null,
      graderId: null,
      submittedAt: addDays(0, 8),
      gradedAt: null,
    },
    create: {
      assignmentId: assignment.id,
      studentId: supportStudents[0].id,
      content: "Bài nộp đang chờ giảng viên góp ý.",
      fileUrl: "https://drive.google.com/file/d/ovc-pending-assignment-demo",
      submittedAt: addDays(0, 8),
    },
  });

  await prisma.potentialStudent.upsert({
    where: { id: "seed-lms-potential-student-ongvangtraining" },
    update: {
      organizationId: organization.id,
      name: primaryStudent.name || "Học viên Ong Vàng Training",
      email: primaryStudent.email,
      phone: primaryStudent.phone,
      source: "Lead/CRM",
      interestedIn: course.title,
      status: "converted",
      note: "Đã chuyển thành học viên và gán lớp LMS demo.",
      nextFollowUpAt: addDays(3, 9),
    },
    create: {
      id: "seed-lms-potential-student-ongvangtraining",
      organizationId: organization.id,
      name: primaryStudent.name || "Học viên Ong Vàng Training",
      email: primaryStudent.email,
      phone: primaryStudent.phone,
      source: "Lead/CRM",
      interestedIn: course.title,
      status: "converted",
      note: "Đã chuyển thành học viên và gán lớp LMS demo.",
      nextFollowUpAt: addDays(3, 9),
    },
  });

  const extraCourses = [
    {
      slug: "ovc-lms-digital-marketing-foundation-2026",
      title: "OVC LMS: Digital Marketing Foundation",
      description: "Khóa nền tảng về phễu marketing, content, landing page, email automation và đo lường chiến dịch cho trung tâm đào tạo.",
      thumbnail: "https://images.unsplash.com/photo-1557804506-669a67965ba0",
      level: "beginner",
      price: 2800000,
      duration: 360,
      tags: ["Marketing", "Content", "Automation", "Landing Page"],
      className: "Lớp Digital Marketing K03/2026",
      classCode: "OVC-MKT-K03-2026",
      meetUrl: "https://meet.google.com/ovc-marketing-demo",
      progress: 42,
      paidAmount: 1200000,
      sections: [
        {
          title: "Chiến lược phễu tuyển sinh",
          lessons: [
            { title: "Mapping hành trình học viên", type: "VIDEO" as const, duration: 22, videoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U" },
            { title: "Xây offer khóa học và lead magnet", type: "VIDEO" as const, duration: 28, videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw" },
          ],
        },
        {
          title: "Automation & đo lường",
          lessons: [
            { title: "Thiết lập landing page tuyển sinh", type: "LIVE" as const, duration: 60, videoUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE" },
            { title: "Bài tập: Audit phễu marketing", type: "ASSIGNMENT" as const, duration: 35, videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
          ],
        },
      ],
    },
    {
      slug: "ovc-lms-operations-finance-2026",
      title: "OVC LMS: Operations & Finance for Training Center",
      description: "Khóa vận hành trung tâm: quản lý lớp, học phí, hóa đơn, thanh toán, lịch học và báo cáo tài chính đào tạo.",
      thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
      level: "intermediate",
      price: 4200000,
      duration: 480,
      tags: ["Operations", "Finance", "Tuition", "Reporting"],
      className: "Lớp Vận hành Trung tâm K02/2026",
      classCode: "OVC-OPS-K02-2026",
      meetUrl: "https://meet.google.com/ovc-operations-demo",
      progress: 68,
      paidAmount: 4200000,
      sections: [
        {
          title: "Quản trị lớp học và lịch học",
          lessons: [
            { title: "Thiết lập lớp, sĩ số và lịch giảng", type: "VIDEO" as const, duration: 26, videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw" },
            { title: "Theo dõi attendance và tiến độ", type: "LIVE" as const, duration: 55, videoUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE" },
          ],
        },
        {
          title: "Học phí và báo cáo",
          lessons: [
            { title: "Tạo học phí, hóa đơn và phiếu thu", type: "VIDEO" as const, duration: 32, videoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U" },
            { title: "Bài tập: Thiết kế dashboard tài chính", type: "ASSIGNMENT" as const, duration: 40, videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
          ],
        },
      ],
    },
    {
      slug: "ovc-lms-ai-productivity-for-instructors-2026",
      title: "OVC LMS: AI Productivity for Instructors",
      description: "Khóa dành cho giảng viên dùng AI để soạn giáo án, rubric, quiz, feedback và cá nhân hóa trải nghiệm học viên.",
      thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
      level: "advanced",
      price: 3900000,
      duration: 300,
      tags: ["AI", "Instructor", "Rubric", "Feedback"],
      className: "Lớp AI Giảng viên K01/2026",
      classCode: "OVC-AI-K01-2026",
      meetUrl: "https://meet.google.com/ovc-ai-instructor-demo",
      progress: 24,
      paidAmount: 0,
      sections: [
        {
          title: "AI trong thiết kế bài giảng",
          lessons: [
            { title: "Prompt framework cho giáo án", type: "VIDEO" as const, duration: 20, videoUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE" },
            { title: "Tạo quiz và rubric bằng AI", type: "VIDEO" as const, duration: 25, videoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U" },
          ],
        },
        {
          title: "Feedback cá nhân hóa",
          lessons: [
            { title: "Workflow chấm bài có AI hỗ trợ", type: "LIVE" as const, duration: 50, videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw" },
            { title: "Bài tập: Viết rubric chấm điểm", type: "ASSIGNMENT" as const, duration: 30, videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
          ],
        },
      ],
    },
  ];

  const allSeededCourses = [course.title];
  let totalExtraLessons = 0;
  let totalExtraEnrollments = 0;

  for (const [courseIndex, courseSeed] of extraCourses.entries()) {
    const seededCourse = await prisma.course.upsert({
      where: { organizationId_slug: { organizationId: organization.id, slug: courseSeed.slug } },
      update: {
        instructorId: instructor.id,
        title: courseSeed.title,
        description: courseSeed.description,
        thumbnail: courseSeed.thumbnail,
        status: "PUBLISHED",
        price: new Prisma.Decimal(courseSeed.price),
        currency: "VND",
        level: courseSeed.level,
        duration: courseSeed.duration,
        tags: courseSeed.tags,
        requirements: ["Có tài khoản OVC Workspace", "Sẵn sàng thực hành trên dữ liệu demo"],
        outcomes: ["Hoàn thiện dashboard học tập", "Áp dụng workflow vận hành thực tế", "Nộp bài tập cuối khóa có phản hồi"],
        isPublic: true,
        isFeatured: courseIndex === 0,
        publishedAt: now,
      },
      create: {
        organizationId: organization.id,
        instructorId: instructor.id,
        title: courseSeed.title,
        slug: courseSeed.slug,
        description: courseSeed.description,
        thumbnail: courseSeed.thumbnail,
        status: "PUBLISHED",
        price: new Prisma.Decimal(courseSeed.price),
        currency: "VND",
        level: courseSeed.level,
        duration: courseSeed.duration,
        tags: courseSeed.tags,
        requirements: ["Có tài khoản OVC Workspace", "Sẵn sàng thực hành trên dữ liệu demo"],
        outcomes: ["Hoàn thiện dashboard học tập", "Áp dụng workflow vận hành thực tế", "Nộp bài tập cuối khóa có phản hồi"],
        isPublic: true,
        isFeatured: courseIndex === 0,
        publishedAt: now,
      },
    });

    const seededLessonIds: string[] = [];
    let seededAssignmentLessonId = "";

    for (const [sectionIndex, sectionSeed] of courseSeed.sections.entries()) {
      const sectionOrder = sectionIndex + 1;
      const section = await prisma.courseSection.upsert({
        where: { id: `seed-lms-extra-section-${seededCourse.id}-${sectionOrder}` },
        update: { title: sectionSeed.title, description: `Module ${sectionOrder} của ${courseSeed.title}`, order: sectionOrder },
        create: {
          id: `seed-lms-extra-section-${seededCourse.id}-${sectionOrder}`,
          courseId: seededCourse.id,
          title: sectionSeed.title,
          description: `Module ${sectionOrder} của ${courseSeed.title}`,
          order: sectionOrder,
        },
      });

      for (const [lessonIndex, lessonSeed] of sectionSeed.lessons.entries()) {
        const lessonOrder = sectionIndex * 10 + lessonIndex + 1;
        const lesson = await prisma.lesson.upsert({
          where: { id: `seed-lms-extra-lesson-${seededCourse.id}-${lessonOrder}` },
          update: {
            sectionId: section.id,
            title: lessonSeed.title,
            type: lessonSeed.type,
            videoUrl: lessonSeed.videoUrl,
            duration: lessonSeed.duration,
            order: lessonOrder,
            isFree: lessonOrder === 1,
            isPublished: true,
            content: `Nội dung LMS demo cho bài ${lessonSeed.title}.`,
            resources: ["https://drive.google.com/drive/folders/ovc-lms-demo", "https://docs.google.com/spreadsheets/d/ovc-lms-scorebook"],
          },
          create: {
            id: `seed-lms-extra-lesson-${seededCourse.id}-${lessonOrder}`,
            sectionId: section.id,
            title: lessonSeed.title,
            type: lessonSeed.type,
            videoUrl: lessonSeed.videoUrl,
            duration: lessonSeed.duration,
            order: lessonOrder,
            isFree: lessonOrder === 1,
            isPublished: true,
            content: `Nội dung LMS demo cho bài ${lessonSeed.title}.`,
            resources: ["https://drive.google.com/drive/folders/ovc-lms-demo", "https://docs.google.com/spreadsheets/d/ovc-lms-scorebook"],
          },
        });

        if (lessonSeed.type === "ASSIGNMENT") seededAssignmentLessonId = lesson.id;
        seededLessonIds.push(lesson.id);
      }
    }

    const seededClass = await prisma.class.upsert({
      where: { id: `seed-lms-extra-class-${seededCourse.id}` },
      update: {
        courseId: seededCourse.id,
        name: courseSeed.className,
        code: courseSeed.classCode,
        startDate: addDays(courseIndex + 2, 19),
        endDate: addDays(50 + courseIndex * 7, 21),
        schedule: { repeat: "weekly", days: ["Mon", "Wed"], time: "19:00-21:00" },
        location: "Online qua Google Meet",
        maxStudents: 40,
        isActive: true,
      },
      create: {
        id: `seed-lms-extra-class-${seededCourse.id}`,
        courseId: seededCourse.id,
        name: courseSeed.className,
        code: courseSeed.classCode,
        startDate: addDays(courseIndex + 2, 19),
        endDate: addDays(50 + courseIndex * 7, 21),
        schedule: { repeat: "weekly", days: ["Mon", "Wed"], time: "19:00-21:00" },
        location: "Online qua Google Meet",
        maxStudents: 40,
        isActive: true,
      },
    });

    for (const [index, lessonId] of seededLessonIds.entries()) {
      await prisma.lessonSchedule.upsert({
        where: { id: `seed-lms-extra-schedule-${seededCourse.id}-${index + 1}` },
        update: {
          lessonId,
          classId: seededClass.id,
          title: `Buổi ${index + 1}: ${courseSeed.sections.flatMap((item) => item.lessons)[index]?.title}`,
          mode: index === 2 ? "HYBRID" : "ONLINE",
          startsAt: addDays(courseIndex * 5 + index * 3 + 2, 19),
          endsAt: addDays(courseIndex * 5 + index * 3 + 2, 21),
          location: "Phòng học online OVC",
          onlineUrl: courseSeed.meetUrl,
          fieldAddress: index === 2 ? "OVC Training Lab, Phan Thiết" : null,
          instructorId: instructor.id,
          capacity: 40,
          note: "Lịch học seed thêm cho LMS dashboard.",
        },
        create: {
          id: `seed-lms-extra-schedule-${seededCourse.id}-${index + 1}`,
          lessonId,
          classId: seededClass.id,
          title: `Buổi ${index + 1}: ${courseSeed.sections.flatMap((item) => item.lessons)[index]?.title}`,
          mode: index === 2 ? "HYBRID" : "ONLINE",
          startsAt: addDays(courseIndex * 5 + index * 3 + 2, 19),
          endsAt: addDays(courseIndex * 5 + index * 3 + 2, 21),
          location: "Phòng học online OVC",
          onlineUrl: courseSeed.meetUrl,
          fieldAddress: index === 2 ? "OVC Training Lab, Phan Thiết" : null,
          instructorId: instructor.id,
          capacity: 40,
          note: "Lịch học seed thêm cho LMS dashboard.",
        },
      });
    }

    for (const [studentIndex, student] of students.entries()) {
      const progress = Math.max(5, Math.min(95, courseSeed.progress - studentIndex * 12));
      const paidAmount = student.id === primaryStudent.id ? courseSeed.paidAmount : Math.max(0, courseSeed.price - studentIndex * 900000);
      const enrollment = await prisma.enrollment.upsert({
        where: { courseId_studentId: { courseId: seededCourse.id, studentId: student.id } },
        update: {
          classId: seededClass.id,
          status: "ACTIVE",
          progress,
          tuitionFee: new Prisma.Decimal(courseSeed.price),
          paidAmount: new Prisma.Decimal(paidAmount),
          paymentStatus: paidAmount >= courseSeed.price ? "paid" : paidAmount > 0 ? "partial" : "unpaid",
          paymentNote: "Học phí demo LMS nhiều khóa.",
          startedAt: addDays(-12 + courseIndex),
        },
        create: {
          courseId: seededCourse.id,
          classId: seededClass.id,
          studentId: student.id,
          status: "ACTIVE",
          progress,
          tuitionFee: new Prisma.Decimal(courseSeed.price),
          paidAmount: new Prisma.Decimal(paidAmount),
          paymentStatus: paidAmount >= courseSeed.price ? "paid" : paidAmount > 0 ? "partial" : "unpaid",
          paymentNote: "Học phí demo LMS nhiều khóa.",
          startedAt: addDays(-12 + courseIndex),
        },
      });

      const completedLessonCount = Math.min(seededLessonIds.length, Math.floor((progress / 100) * seededLessonIds.length));
      for (const lessonId of seededLessonIds.slice(0, completedLessonCount)) {
        await prisma.lessonCompletion.upsert({
          where: { lessonId_enrollmentId: { lessonId, enrollmentId: enrollment.id } },
          update: { completedAt: addDays(-studentIndex - courseIndex - 1) },
          create: { lessonId, enrollmentId: enrollment.id, completedAt: addDays(-studentIndex - courseIndex - 1) },
        });
      }

      await prisma.attendance.upsert({
        where: { classId_studentId_date: { classId: seededClass.id, studentId: student.id, date: addDays(courseIndex - 3, 19) } },
        update: { present: studentIndex !== 3, note: studentIndex === 3 ? "Vắng có phép" : "Có mặt trong buổi live" },
        create: { classId: seededClass.id, studentId: student.id, date: addDays(courseIndex - 3, 19), present: studentIndex !== 3, note: studentIndex === 3 ? "Vắng có phép" : "Có mặt trong buổi live" },
      });
    }

    const seededAssignment = await prisma.assignment.upsert({
      where: { id: `seed-lms-extra-assignment-${seededCourse.id}` },
      update: {
        lessonId: seededAssignmentLessonId || seededLessonIds[0],
        title: `Bài tập cuối khóa: ${courseSeed.title}`,
        description: "Nộp bài thực hành theo case study của khóa, có rubric và feedback từ giảng viên.",
        dueDate: addDays(10 + courseIndex * 2, 23, 59),
        maxScore: 100,
      },
      create: {
        id: `seed-lms-extra-assignment-${seededCourse.id}`,
        lessonId: seededAssignmentLessonId || seededLessonIds[0],
        title: `Bài tập cuối khóa: ${courseSeed.title}`,
        description: "Nộp bài thực hành theo case study của khóa, có rubric và feedback từ giảng viên.",
        dueDate: addDays(10 + courseIndex * 2, 23, 59),
        maxScore: 100,
      },
    });

    await prisma.assignmentSubmission.upsert({
      where: { assignmentId_studentId: { assignmentId: seededAssignment.id, studentId: primaryStudent.id } },
      update: {
        content: `Bài nộp của ongvangtraining@gmail.com cho khóa ${courseSeed.title}.`,
        fileUrl: `https://drive.google.com/file/d/ovc-${courseSeed.slug}-submission`,
        score: courseIndex === 2 ? null : 78 + courseIndex * 6,
        feedback: courseIndex === 2 ? null : "Đã nắm được workflow chính, cần bổ sung minh chứng số liệu.",
        graderId: courseIndex === 2 ? null : instructor.id,
        submittedAt: addDays(-courseIndex - 1, 21),
        gradedAt: courseIndex === 2 ? null : addDays(-courseIndex, 9),
      },
      create: {
        assignmentId: seededAssignment.id,
        studentId: primaryStudent.id,
        graderId: courseIndex === 2 ? null : instructor.id,
        content: `Bài nộp của ongvangtraining@gmail.com cho khóa ${courseSeed.title}.`,
        fileUrl: `https://drive.google.com/file/d/ovc-${courseSeed.slug}-submission`,
        score: courseIndex === 2 ? null : 78 + courseIndex * 6,
        feedback: courseIndex === 2 ? null : "Đã nắm được workflow chính, cần bổ sung minh chứng số liệu.",
        submittedAt: addDays(-courseIndex - 1, 21),
        gradedAt: courseIndex === 2 ? null : addDays(-courseIndex, 9),
      },
    });

    allSeededCourses.push(seededCourse.title);
    totalExtraLessons += seededLessonIds.length;
    totalExtraEnrollments += students.length;
  }

  const instructorCourses = await prisma.course.findMany({
    where: { organizationId: organization.id, instructorId: instructor.id },
    include: { sections: { include: { lessons: true } }, classes: true },
  });
  const emptyInstructorCourses = instructorCourses.filter((item) => item.sections.length === 0 || item.classes.length === 0);

  for (const [emptyIndex, emptyCourse] of emptyInstructorCourses.entries()) {
    const section = await prisma.courseSection.upsert({
      where: { id: `seed-lms-backfill-section-${emptyCourse.id}` },
      update: {
        title: "Lộ trình LMS chuẩn",
        description: "Module bổ sung để khóa có đủ bài học, lịch học và bài tập demo.",
        order: 1,
      },
      create: {
        id: `seed-lms-backfill-section-${emptyCourse.id}`,
        courseId: emptyCourse.id,
        title: "Lộ trình LMS chuẩn",
        description: "Module bổ sung để khóa có đủ bài học, lịch học và bài tập demo.",
        order: 1,
      },
    });

    const backfillLessons = [
      { title: "Tổng quan khóa học và mục tiêu", type: "VIDEO" as const, duration: 20, videoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U" },
      { title: "Buổi live thực hành cùng giảng viên", type: "LIVE" as const, duration: 60, videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw" },
      { title: "Bài tập ứng dụng cuối module", type: "ASSIGNMENT" as const, duration: 35, videoUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE" },
    ];
    const backfillLessonIds: string[] = [];

    for (const [lessonIndex, lessonSeed] of backfillLessons.entries()) {
      const lesson = await prisma.lesson.upsert({
        where: { id: `seed-lms-backfill-lesson-${emptyCourse.id}-${lessonIndex + 1}` },
        update: {
          sectionId: section.id,
          title: lessonSeed.title,
          type: lessonSeed.type,
          videoUrl: lessonSeed.videoUrl,
          duration: lessonSeed.duration,
          order: lessonIndex + 1,
          isFree: lessonIndex === 0,
          isPublished: true,
          content: `Nội dung bổ sung cho khóa ${emptyCourse.title}.`,
          resources: ["https://drive.google.com/drive/folders/ovc-backfill-lms"],
        },
        create: {
          id: `seed-lms-backfill-lesson-${emptyCourse.id}-${lessonIndex + 1}`,
          sectionId: section.id,
          title: lessonSeed.title,
          type: lessonSeed.type,
          videoUrl: lessonSeed.videoUrl,
          duration: lessonSeed.duration,
          order: lessonIndex + 1,
          isFree: lessonIndex === 0,
          isPublished: true,
          content: `Nội dung bổ sung cho khóa ${emptyCourse.title}.`,
          resources: ["https://drive.google.com/drive/folders/ovc-backfill-lms"],
        },
      });
      backfillLessonIds.push(lesson.id);
    }

    const backfillClass = await prisma.class.upsert({
      where: { id: `seed-lms-backfill-class-${emptyCourse.id}` },
      update: {
        courseId: emptyCourse.id,
        name: `${emptyCourse.title} - Lớp LMS Demo`,
        code: `OVC-BACKFILL-${emptyIndex + 1}`,
        startDate: addDays(4 + emptyIndex, 19),
        endDate: addDays(35 + emptyIndex, 21),
        schedule: { repeat: "weekly", days: ["Tue", "Thu"], time: "19:00-21:00" },
        location: "Online qua Google Meet",
        maxStudents: 30,
        isActive: true,
      },
      create: {
        id: `seed-lms-backfill-class-${emptyCourse.id}`,
        courseId: emptyCourse.id,
        name: `${emptyCourse.title} - Lớp LMS Demo`,
        code: `OVC-BACKFILL-${emptyIndex + 1}`,
        startDate: addDays(4 + emptyIndex, 19),
        endDate: addDays(35 + emptyIndex, 21),
        schedule: { repeat: "weekly", days: ["Tue", "Thu"], time: "19:00-21:00" },
        location: "Online qua Google Meet",
        maxStudents: 30,
        isActive: true,
      },
    });

    for (const [index, lessonId] of backfillLessonIds.entries()) {
      await prisma.lessonSchedule.upsert({
        where: { id: `seed-lms-backfill-schedule-${emptyCourse.id}-${index + 1}` },
        update: {
          lessonId,
          classId: backfillClass.id,
          title: `Buổi ${index + 1}: ${backfillLessons[index]?.title}`,
          mode: index === 1 ? "HYBRID" : "ONLINE",
          startsAt: addDays(4 + emptyIndex + index * 3, 19),
          endsAt: addDays(4 + emptyIndex + index * 3, 21),
          location: "Phòng học online OVC",
          onlineUrl: "https://meet.google.com/ovc-backfill-demo",
          fieldAddress: index === 1 ? "OVC Training Lab, Phan Thiết" : null,
          instructorId: instructor.id,
          capacity: 30,
          note: "Lịch bổ sung cho khóa instructor đã có sẵn.",
        },
        create: {
          id: `seed-lms-backfill-schedule-${emptyCourse.id}-${index + 1}`,
          lessonId,
          classId: backfillClass.id,
          title: `Buổi ${index + 1}: ${backfillLessons[index]?.title}`,
          mode: index === 1 ? "HYBRID" : "ONLINE",
          startsAt: addDays(4 + emptyIndex + index * 3, 19),
          endsAt: addDays(4 + emptyIndex + index * 3, 21),
          location: "Phòng học online OVC",
          onlineUrl: "https://meet.google.com/ovc-backfill-demo",
          fieldAddress: index === 1 ? "OVC Training Lab, Phan Thiết" : null,
          instructorId: instructor.id,
          capacity: 30,
          note: "Lịch bổ sung cho khóa instructor đã có sẵn.",
        },
      });
    }

    const backfillEnrollment = await prisma.enrollment.upsert({
      where: { courseId_studentId: { courseId: emptyCourse.id, studentId: primaryStudent.id } },
      update: {
        classId: backfillClass.id,
        status: "ACTIVE",
        progress: 35,
        tuitionFee: new Prisma.Decimal(2500000),
        paidAmount: new Prisma.Decimal(1000000),
        paymentStatus: "partial",
        paymentNote: "Enrollment bổ sung để student dashboard có dữ liệu khóa instructor cũ.",
        startedAt: addDays(-5),
      },
      create: {
        courseId: emptyCourse.id,
        classId: backfillClass.id,
        studentId: primaryStudent.id,
        status: "ACTIVE",
        progress: 35,
        tuitionFee: new Prisma.Decimal(2500000),
        paidAmount: new Prisma.Decimal(1000000),
        paymentStatus: "partial",
        paymentNote: "Enrollment bổ sung để student dashboard có dữ liệu khóa instructor cũ.",
        startedAt: addDays(-5),
      },
    });

    await prisma.lessonCompletion.upsert({
      where: { lessonId_enrollmentId: { lessonId: backfillLessonIds[0], enrollmentId: backfillEnrollment.id } },
      update: { completedAt: addDays(-2) },
      create: { lessonId: backfillLessonIds[0], enrollmentId: backfillEnrollment.id, completedAt: addDays(-2) },
    });

    const backfillAssignment = await prisma.assignment.upsert({
      where: { id: `seed-lms-backfill-assignment-${emptyCourse.id}` },
      update: {
        lessonId: backfillLessonIds[2],
        title: `Bài tập ứng dụng: ${emptyCourse.title}`,
        description: "Bài tập bổ sung để khóa có dữ liệu chấm điểm LMS.",
        dueDate: addDays(9, 23, 59),
        maxScore: 100,
      },
      create: {
        id: `seed-lms-backfill-assignment-${emptyCourse.id}`,
        lessonId: backfillLessonIds[2],
        title: `Bài tập ứng dụng: ${emptyCourse.title}`,
        description: "Bài tập bổ sung để khóa có dữ liệu chấm điểm LMS.",
        dueDate: addDays(9, 23, 59),
        maxScore: 100,
      },
    });

    await prisma.assignmentSubmission.upsert({
      where: { assignmentId_studentId: { assignmentId: backfillAssignment.id, studentId: primaryStudent.id } },
      update: {
        content: `Bài nộp demo của ongvangtraining@gmail.com cho khóa ${emptyCourse.title}.`,
        fileUrl: `https://drive.google.com/file/d/ovc-backfill-${emptyCourse.id}`,
        score: null,
        feedback: null,
        graderId: null,
        submittedAt: addDays(-1, 20),
        gradedAt: null,
      },
      create: {
        assignmentId: backfillAssignment.id,
        studentId: primaryStudent.id,
        content: `Bài nộp demo của ongvangtraining@gmail.com cho khóa ${emptyCourse.title}.`,
        fileUrl: `https://drive.google.com/file/d/ovc-backfill-${emptyCourse.id}`,
        submittedAt: addDays(-1, 20),
      },
    });

    allSeededCourses.push(emptyCourse.title);
    totalExtraLessons += backfillLessonIds.length;
    totalExtraEnrollments += 1;
  }

  console.log(JSON.stringify({
    organization: organization.slug,
    instructor: instructor.email,
    student: primaryStudent.email,
    password: DEMO_PASSWORD,
    courses: allSeededCourses,
    class: classObj.name,
    lessons: lessonIds.length + totalExtraLessons,
    youtubeLessons: sections.flatMap((item) => item.lessons).map((lesson) => lesson.videoUrl),
    enrollments: students.length + totalExtraEnrollments,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
