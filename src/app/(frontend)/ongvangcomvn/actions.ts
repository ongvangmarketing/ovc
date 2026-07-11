"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { syncTuitionInvoiceForSession } from "@/lib/training/tuition-finance";
import { sendEnrollmentConfirmationEmail } from "@/lib/notifications/training";
import { sendPortalAccessEmailForUser } from "@/actions/settings";

export async function getOrganization() {
  let org = await prisma.organization.findFirst({
    where: { name: { contains: "Ong Vàng", mode: "insensitive" } },
  });
  if (!org) org = await prisma.organization.findFirst();
  return org;
}

export async function getServices(organizationId: string) {
  return await prisma.service.findMany({
    where: { organizationId, status: "ACTIVE" },
    include: {
      options: {
        where: { status: "ACTIVE" },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getServiceBySlug(organizationId: string, slug: string) {
  return await prisma.service.findUnique({
    where: { organizationId_slug: { organizationId, slug } },
    include: {
      category: true,
      options: {
        where: { status: "ACTIVE" },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function getCourses(organizationId: string) {
  return await prisma.course.findMany({
    where: { organizationId, status: "PUBLISHED" },
    include: {
      instructor: true,
      classes: {
        where: { isActive: true },
        orderBy: { startDate: "asc" },
      },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCourseBySlug(organizationId: string, slug: string) {
  return await prisma.course.findUnique({
    where: { organizationId_slug: { organizationId, slug } },
    include: {
      instructor: true,
      classes: {
        where: { isActive: true },
        orderBy: { startDate: "asc" },
      },
      sections: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });
}

export async function submitLead(formData: FormData) {
  const organizationId = formData.get("organizationId") as string;
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const note = formData.get("note") as string;

  if (!organizationId || !fullName) return { error: "Vui lòng điền họ tên!" };

  try {
    const newLead = await prisma.lead.create({
      data: { organizationId, fullName, email, phone, note, status: "NEW", sourceId: null },
    });
    revalidatePath("/ongvangcomvn");
    return { success: true, lead: newLead };
  } catch (error: unknown) {
    console.error("submitLead error:", error);
    return { error: error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại sau." };
  }
}

export async function checkoutCourse(formData: FormData) {
  const organizationId = formData.get("organizationId") as string;
  const courseSlug = formData.get("courseSlug") as string;
  const className = formData.get("className") as string;
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;

  if (!organizationId || !fullName || !email) return { error: "Vui lòng điền đủ họ tên và email!" };

  try {
    const course = await prisma.course.findUnique({
      where: { organizationId_slug: { organizationId, slug: courseSlug } },
      include: { classes: true }
    });
    if (!course) return { error: "Không tìm thấy khóa học" };

    let classId = null;
    if (className) {
      const cls = course.classes.find(c => c.name === className);
      if (cls) classId = cls.id;
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    const isNewUser = !user;
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: fullName,
          phone,
          role: "CUSTOMER",
          organizationMembers: {
            create: { organizationId, role: "MEMBER" }
          }
        }
      });
    } else {
      // Ensure org membership for existing user
      await prisma.organizationMember.upsert({
        where: { organizationId_userId: { organizationId, userId: user.id } },
        create: { organizationId, role: "MEMBER", userId: user.id },
        update: {},
      });
    }

    // Check if enrollment already exists
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { courseId_studentId: { courseId: course.id, studentId: user.id } }
    });
    
    if (existingEnrollment && existingEnrollment.status !== "PENDING") {
       return { error: "Học viên này đã ghi danh khóa học!" };
    }

    let enrollmentId: string;

    if (!existingEnrollment) {
      const enrollment = await prisma.enrollment.create({
        data: {
          courseId: course.id,
          classId: classId,
          studentId: user.id,
          status: "PENDING",
          tuitionFee: course.price,
          paymentStatus: "unpaid",
        }
      });
      enrollmentId = enrollment.id;
    } else {
      enrollmentId = existingEnrollment.id;
    }

    // Sync with Finance (create or update Invoice and Contact)
    const syncRes = await syncTuitionInvoiceForSession(enrollmentId, {
      organizationId,
      userId: user.id
    });

    if (!syncRes.success) {
      return { error: syncRes.error || "Có lỗi xảy ra khi tạo hóa đơn." };
    }

    // Send portal credentials (new user: random password; existing user: reset password)
    await sendPortalAccessEmailForUser(user.id, undefined, "/student").catch((e) =>
      console.error("sendPortalAccessEmailForUser error:", e)
    );

    // Send enrollment confirmation with invoice link
    await sendEnrollmentConfirmationEmail({
      organizationId,
      studentName: user.name || fullName,
      studentEmail: user.email,
      courseName: course.title,
      className: className || course.title,
      tuitionFee: Number(course.price),
      invoiceToken: syncRes.invoiceToken,
    });

    revalidatePath("/ongvangcomvn");
    revalidatePath("/workspace/training/tuition");
    return { success: true, invoiceToken: syncRes.invoiceToken };
  } catch (error: unknown) {
    console.error("checkoutCourse error:", error);
    return { error: error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại sau." };
  }
}

