import "dotenv/config";

import mysql from "mysql2/promise";
import { Prisma, PrismaClient, UserRole } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

type LegacyCourse = {
  id: number;
  instructor_id: number | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  image: string | null;
  duration: string | null;
  tuition_fee: string | number | null;
  max_students: number | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type LegacyUser = {
  id: number;
  name: string;
  email: string;
  created_at: string | null;
  updated_at: string | null;
};

type LegacyStudent = {
  id: number;
  user_id: number;
  phone: string | null;
  address: string | null;
  internal_notes: string | null;
  status: string | null;
};

type LegacyClass = {
  id: number;
  course_id: number;
  instructor_id: number | null;
  name: string;
  room: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type LegacyCourseStudent = {
  course_id: number;
  student_id: number;
  enrolled_at: string | null;
  tuition_fee: string | number | null;
  payment_status: string | null;
  progress: string | number | null;
};

type LegacyClassStudent = {
  class_id: number;
  student_id: number;
  tuition_fee?: string | number | null;
  paid_amount?: string | number | null;
  payment_status?: string | null;
  payment_note?: string | null;
  enrolled_at?: string | null;
};

type LegacySchedule = {
  id: number;
  class_id: number;
  starts_at: string;
  ends_at: string;
  location: string | null;
  meeting_url: string | null;
};

type LegacyLead = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  source?: string | null;
  demand?: string | null;
  course_id?: number | null;
  status: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pgPool) });

function env(name: string, fallback = "") {
  return process.env[name] || fallback;
}

function num(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function date(value?: string | null) {
  return value ? new Date(value) : undefined;
}

function courseStatus(value?: string | null) {
  if (value === "published" || value === "active") return "PUBLISHED" as const;
  if (value === "archived") return "ARCHIVED" as const;
  return "DRAFT" as const;
}

function enrollmentStatus(value?: string | null, progress?: unknown) {
  if (num(progress) >= 100) return "COMPLETED" as const;
  if (value === "paid" || value === "partial" || value === "active") return "ACTIVE" as const;
  if (value === "cancelled" || value === "dropped") return "DROPPED" as const;
  return "PENDING" as const;
}

function paymentStatus(value?: string | null, fee = 0, paid = 0) {
  if (value) return value;
  if (fee > 0 && paid >= fee) return "paid";
  if (paid > 0) return "partial";
  return "unpaid";
}

function scheduleSummary(rows: LegacySchedule[]) {
  return {
    source: "ongvang.com.vn",
    importedAt: new Date().toISOString(),
    sessions: rows.map((row) => ({
      legacyId: row.id,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      location: row.location,
      meetingUrl: row.meeting_url,
    })),
  };
}

async function query<T>(connection: mysql.Connection, sql: string, params: unknown[] = []) {
  const [rows] = await connection.query(sql, params);
  return rows as T[];
}

async function tableExists(connection: mysql.Connection, database: string, table: string) {
  const rows = await query<{ count: number }>(
    connection,
    "select count(*) as count from information_schema.tables where table_schema = ? and table_name = ?",
    [database, table],
  );
  return num(rows[0]?.count) > 0;
}

async function main() {
  const organizationSlug = process.env.TARGET_ORGANIZATION_SLUG || process.argv.find((item) => item.startsWith("--org="))?.replace("--org=", "");
  const organization = organizationSlug
    ? await prisma.organization.findUnique({ where: { slug: organizationSlug } })
    : await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } });

  if (!organization) throw new Error("Không tìm thấy organization để import.");

  const legacyDb = env("LEGACY_EDUCATION_DB", "ongvang_education");
  const mainDb = env("LEGACY_MAIN_DB", env("DB_DATABASE", "ongvang_company"));
  const connection = await mysql.createConnection({
    host: env("LEGACY_DB_HOST", env("DB_HOST", "localhost")),
    port: Number(env("LEGACY_DB_PORT", env("DB_PORT", "3306"))),
    user: env("LEGACY_DB_USER", env("DB_USERNAME", "ongvangmacbook")),
    password: env("LEGACY_DB_PASSWORD", env("DB_PASSWORD", "")),
    socketPath: env("LEGACY_DB_SOCKET", env("DB_SOCKET", "/tmp/mysql.sock")) || undefined,
    multipleStatements: false,
  });

  const owner = await prisma.user.findUnique({ where: { id: organization.ownerId } });
  if (!owner) throw new Error("Organization thiếu owner.");

  const [legacyUsers, legacyStudents, legacyCourses, legacyClasses, legacyCourseStudents, legacyClassStudents, legacySchedules] = await Promise.all([
    query<LegacyUser>(connection, `select id, name, email, created_at, updated_at from ${mainDb}.users`),
    query<LegacyStudent>(connection, `select id, user_id, phone, address, internal_notes, status from ${legacyDb}.students`),
    query<LegacyCourse>(connection, `select id, instructor_id, name, slug, short_description, description, image, duration, tuition_fee, max_students, status, created_at, updated_at from ${legacyDb}.courses`),
    query<LegacyClass>(connection, `select id, course_id, instructor_id, name, room, start_date, end_date, status, created_at, updated_at from ${legacyDb}.classes`),
    query<LegacyCourseStudent>(connection, `select course_id, student_id, enrolled_at, tuition_fee, payment_status, progress from ${legacyDb}.course_student`),
    query<LegacyClassStudent>(connection, `select class_id, student_id, tuition_fee, paid_amount, payment_status, payment_note, enrolled_at from ${legacyDb}.class_student`),
    query<LegacySchedule>(connection, `select id, class_id, starts_at, ends_at, location, meeting_url from ${legacyDb}.schedules`),
  ]);

  const usersByLegacyId = new Map(legacyUsers.map((user) => [user.id, user]));
  const studentByLegacyId = new Map(legacyStudents.map((student) => [student.id, student]));
  const userIdByLegacyUserId = new Map<number, string>();
  const courseIdByLegacyId = new Map<number, string>();
  const classIdByLegacyId = new Map<number, string>();
  const classByLegacyId = new Map(legacyClasses.map((item) => [item.id, item]));
  const schedulesByClass = new Map<number, LegacySchedule[]>();

  for (const schedule of legacySchedules) {
    schedulesByClass.set(schedule.class_id, [...(schedulesByClass.get(schedule.class_id) || []), schedule]);
  }

  const instructorLegacyIds = new Set(legacyCourses.map((course) => course.instructor_id).filter((id): id is number => Boolean(id)));
  const studentLegacyUserIds = new Set(legacyStudents.map((student) => student.user_id));

  for (const legacyUser of legacyUsers) {
    const role = instructorLegacyIds.has(legacyUser.id) ? UserRole.INSTRUCTOR : studentLegacyUserIds.has(legacyUser.id) ? UserRole.STUDENT : UserRole.CUSTOMER;
    const studentProfile = legacyStudents.find((item) => item.user_id === legacyUser.id);
    const user = await prisma.user.upsert({
      where: { email: legacyUser.email },
      update: {
        name: legacyUser.name,
        phone: studentProfile?.phone || undefined,
        role: role === UserRole.CUSTOMER ? undefined : role,
      },
      create: {
        name: legacyUser.name,
        email: legacyUser.email,
        emailVerified: true,
        phone: studentProfile?.phone || null,
        role,
      },
    });
    userIdByLegacyUserId.set(legacyUser.id, user.id);
    await prisma.organizationMember.upsert({
      where: { organizationId_userId: { organizationId: organization.id, userId: user.id } },
      update: {},
      create: { organizationId: organization.id, userId: user.id, role: "MEMBER" },
    });
  }

  for (const legacyCourse of legacyCourses) {
    const instructorId = legacyCourse.instructor_id ? userIdByLegacyUserId.get(legacyCourse.instructor_id) : null;
    const course = await prisma.course.upsert({
      where: { organizationId_slug: { organizationId: organization.id, slug: legacyCourse.slug || `legacy-course-${legacyCourse.id}` } },
      update: {
        title: legacyCourse.name,
        description: legacyCourse.description || legacyCourse.short_description,
        thumbnail: legacyCourse.image,
        status: courseStatus(legacyCourse.status),
        price: new Prisma.Decimal(num(legacyCourse.tuition_fee)),
        duration: legacyCourse.duration ? Number.parseInt(String(legacyCourse.duration), 10) || null : null,
        instructorId: instructorId || owner.id,
      },
      create: {
        organizationId: organization.id,
        instructorId: instructorId || owner.id,
        title: legacyCourse.name,
        slug: legacyCourse.slug || `legacy-course-${legacyCourse.id}`,
        description: legacyCourse.description || legacyCourse.short_description,
        thumbnail: legacyCourse.image,
        status: courseStatus(legacyCourse.status),
        price: new Prisma.Decimal(num(legacyCourse.tuition_fee)),
        duration: legacyCourse.duration ? Number.parseInt(String(legacyCourse.duration), 10) || null : null,
        publishedAt: courseStatus(legacyCourse.status) === "PUBLISHED" ? date(legacyCourse.updated_at || legacyCourse.created_at) : undefined,
      },
    });
    courseIdByLegacyId.set(legacyCourse.id, course.id);
  }

  for (const legacyClass of legacyClasses) {
    const courseId = courseIdByLegacyId.get(legacyClass.course_id);
    if (!courseId) continue;
    const existing = await prisma.class.findFirst({ where: { courseId, name: legacyClass.name } });
    const payload = {
      code: `OVC-${legacyClass.id}`,
      startDate: date(legacyClass.start_date),
      endDate: date(legacyClass.end_date),
      location: legacyClass.room,
      maxStudents: legacyCourses.find((course) => course.id === legacyClass.course_id)?.max_students || 30,
      isActive: legacyClass.status !== "inactive" && legacyClass.status !== "closed",
      schedule: scheduleSummary(schedulesByClass.get(legacyClass.id) || []),
    };
    const item = existing
      ? await prisma.class.update({ where: { id: existing.id }, data: payload })
      : await prisma.class.create({ data: { courseId, name: legacyClass.name, ...payload } });
    classIdByLegacyId.set(legacyClass.id, item.id);
  }

  for (const pivot of legacyCourseStudents) {
    const student = studentByLegacyId.get(pivot.student_id);
    const courseId = courseIdByLegacyId.get(pivot.course_id);
    const userId = student ? userIdByLegacyUserId.get(student.user_id) : null;
    if (!courseId || !userId) continue;
    const classPivot = legacyClassStudents.find((item) => item.student_id === pivot.student_id && classByLegacyId.get(item.class_id)?.course_id === pivot.course_id);
    const classId = classPivot ? classIdByLegacyId.get(classPivot.class_id) : null;
    const classTuition = classPivot?.tuition_fee != null ? num(classPivot.tuition_fee) : num(pivot.tuition_fee);
    const paidAmount = classPivot?.paid_amount != null ? num(classPivot.paid_amount) : 0;
    const enrollmentPaymentStatus = classPivot?.payment_status || pivot.payment_status;
    await prisma.enrollment.upsert({
      where: { courseId_studentId: { courseId, studentId: userId } },
      update: {
        classId: classId || undefined,
        status: enrollmentStatus(enrollmentPaymentStatus, pivot.progress),
        progress: Math.min(100, Math.max(0, Math.round(num(pivot.progress)))),
        tuitionFee: new Prisma.Decimal(classTuition),
        paidAmount: new Prisma.Decimal(paidAmount),
        paymentStatus: paymentStatus(enrollmentPaymentStatus, classTuition, paidAmount),
        paymentNote: classPivot?.payment_note || undefined,
        startedAt: date(classPivot?.enrolled_at || pivot.enrolled_at),
      },
      create: {
        courseId,
        classId: classId || undefined,
        studentId: userId,
        status: enrollmentStatus(enrollmentPaymentStatus, pivot.progress),
        progress: Math.min(100, Math.max(0, Math.round(num(pivot.progress)))),
        tuitionFee: new Prisma.Decimal(classTuition),
        paidAmount: new Prisma.Decimal(paidAmount),
        paymentStatus: paymentStatus(enrollmentPaymentStatus, classTuition, paidAmount),
        paymentNote: classPivot?.payment_note || undefined,
        startedAt: date(classPivot?.enrolled_at || pivot.enrolled_at),
      },
    });
  }

  let leadsImported = 0;
  if (await tableExists(connection, legacyDb, "potential_students")) {
    const leads = await query<LegacyLead>(connection, `select id, name, email, phone, course_id, status, notes, created_at, updated_at from ${legacyDb}.potential_students`);
    for (const lead of leads) {
      const existing = await prisma.potentialStudent.findFirst({
        where: {
          organizationId: organization.id,
          OR: [
            lead.email ? { email: lead.email } : undefined,
            lead.phone ? { phone: lead.phone } : undefined,
            { name: lead.name },
          ].filter(Boolean) as Prisma.PotentialStudentWhereInput[],
        },
      });
      const data = {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source || "Education",
        interestedIn: lead.course_id ? legacyCourses.find((course) => course.id === lead.course_id)?.name : lead.demand,
        status: lead.status || "new",
        note: lead.notes,
      };
      if (existing) await prisma.potentialStudent.update({ where: { id: existing.id }, data });
      else await prisma.potentialStudent.create({ data: { organizationId: organization.id, ...data } });
      leadsImported += 1;
    }
  }

  await connection.end();
  console.log(JSON.stringify({
    organization: organization.slug,
    users: legacyUsers.length,
    courses: legacyCourses.length,
    students: legacyStudents.length,
    classes: legacyClasses.length,
    schedules: legacySchedules.length,
    enrollments: legacyCourseStudents.length,
    potentialStudents: leadsImported,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pgPool.end();
  });
