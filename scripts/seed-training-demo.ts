import "dotenv/config";

import { Prisma, PrismaClient, UserRole } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import { classMockData } from "../src/app/workspace/training/classes/classes.mock";
import { potentialStudentMockData } from "../src/app/workspace/training/potential-students/potential-students.mock";
import { studentMockData } from "../src/app/workspace/training/students/students.mock";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function getOrganization() {
  const slug = process.env.TARGET_ORGANIZATION_SLUG || "ong-vang";
  const organization =
    (await prisma.organization.findUnique({ where: { slug } })) ||
    (await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } }));

  if (!organization) throw new Error("Không tìm thấy organization để seed training.");
  return organization;
}

async function ensureUser(email: string, name: string, role: UserRole, organizationId: string) {
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role, emailVerified: true, isActive: true },
    create: { email, name, role, emailVerified: true, isActive: true, onboarded: true },
  });

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId, userId: user.id } },
    update: {},
    create: { organizationId, userId: user.id, role: "MEMBER" },
  });

  return user;
}

async function main() {
  const organization = await getOrganization();
  const instructor = await ensureUser("training@ongvang.com.vn", "TRUNG MARKETING", UserRole.INSTRUCTOR, organization.id);

  const courseByName = new Map<string, string>();
  const firstLessonByCourse = new Map<string, string>();

  for (const mockClass of classMockData) {
    if (!courseByName.has(mockClass.course)) {
      const slug = mockClass.course.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || mockClass.id;
      const course = await prisma.course.upsert({
        where: { organizationId_slug: { organizationId: organization.id, slug } },
        update: {
          title: mockClass.course,
          instructorId: instructor.id,
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
        create: {
          organizationId: organization.id,
          instructorId: instructor.id,
          title: mockClass.course,
          slug,
          description: `Chương trình đào tạo ${mockClass.course} của Ong Vàng.`,
          status: "PUBLISHED",
          price: new Prisma.Decimal(0),
          publishedAt: new Date(),
        },
      });

      const section = await prisma.courseSection.upsert({
        where: { id: `seed-section-${course.id}` },
        update: { title: "Lộ trình chính" },
        create: { id: `seed-section-${course.id}`, courseId: course.id, title: "Lộ trình chính", order: 1 },
      });

      const lesson = await prisma.lesson.upsert({
        where: { id: `seed-lesson-${course.id}` },
        update: { title: "Buổi khai giảng" },
        create: {
          id: `seed-lesson-${course.id}`,
          sectionId: section.id,
          title: "Buổi khai giảng",
          type: "LIVE",
          duration: 90,
          order: 1,
          isPublished: true,
        },
      });

      courseByName.set(mockClass.course, course.id);
      firstLessonByCourse.set(course.id, lesson.id);
    }

    const courseId = courseByName.get(mockClass.course);
    if (!courseId) continue;

    const item = await prisma.class.upsert({
      where: { id: mockClass.id },
      update: {
        courseId,
        name: mockClass.name,
        code: mockClass.code,
        startDate: mockClass.startDate ? new Date(mockClass.startDate) : null,
        endDate: mockClass.endDate ? new Date(mockClass.endDate) : null,
        location: mockClass.location,
        maxStudents: mockClass.maxStudents,
        isActive: mockClass.isActive,
      },
      create: {
        id: mockClass.id,
        courseId,
        name: mockClass.name,
        code: mockClass.code,
        startDate: mockClass.startDate ? new Date(mockClass.startDate) : null,
        endDate: mockClass.endDate ? new Date(mockClass.endDate) : null,
        location: mockClass.location,
        maxStudents: mockClass.maxStudents,
        isActive: mockClass.isActive,
      },
    });

    const lessonId = firstLessonByCourse.get(courseId);
    if (lessonId) {
      await prisma.lessonSchedule.upsert({
        where: { id: `seed-schedule-${item.id}` },
        update: {
          lessonId,
          classId: item.id,
          title: `${item.name} - Buổi 1`,
          startsAt: item.startDate,
          location: item.location,
          instructorId: instructor.id,
        },
        create: {
          id: `seed-schedule-${item.id}`,
          lessonId,
          classId: item.id,
          title: `${item.name} - Buổi 1`,
          mode: item.location?.toLowerCase().includes("online") ? "ONLINE" : "OFFLINE",
          startsAt: item.startDate,
          location: item.location,
          instructorId: instructor.id,
        },
      });
    }
  }

  const defaultCourseId = courseByName.values().next().value as string | undefined;
  const defaultClassId = classMockData[0]?.id;

  for (const mockStudent of studentMockData) {
    const user = await ensureUser(mockStudent.email, mockStudent.name, UserRole.STUDENT, organization.id);
    if (defaultCourseId) {
      await prisma.enrollment.upsert({
        where: { courseId_studentId: { courseId: defaultCourseId, studentId: user.id } },
        update: {
          classId: defaultClassId,
          status: mockStudent.completed > 0 ? "COMPLETED" : mockStudent.active > 0 ? "ACTIVE" : "PENDING",
          progress: mockStudent.progress,
        },
        create: {
          courseId: defaultCourseId,
          classId: defaultClassId,
          studentId: user.id,
          status: mockStudent.completed > 0 ? "COMPLETED" : mockStudent.active > 0 ? "ACTIVE" : "PENDING",
          progress: mockStudent.progress,
        },
      });
    }
  }

  for (const lead of potentialStudentMockData) {
    await prisma.potentialStudent.upsert({
      where: { id: lead.id },
      update: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        interestedIn: lead.interestedIn,
        status: lead.status,
        note: lead.note,
        nextFollowUpAt: lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt) : null,
      },
      create: {
        id: lead.id,
        organizationId: organization.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        interestedIn: lead.interestedIn,
        status: lead.status,
        note: lead.note,
        nextFollowUpAt: lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt) : null,
      },
    });
  }

  console.log(JSON.stringify({
    organization: organization.slug,
    courses: courseByName.size,
    classes: classMockData.length,
    students: studentMockData.length,
    potentialStudents: potentialStudentMockData.length,
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
