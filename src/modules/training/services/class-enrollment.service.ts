import { getTenantDb } from "@/lib/db";
import { syncTuitionInvoiceForSession } from "@/lib/training/tuition-finance";
import { sendEnrollmentConfirmationEmail } from "@/lib/notifications/training";
import { sendPortalAccessEmailForUser } from "@/actions/settings";

function randomPassword(length = 10) {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export class ClassEnrollmentService {
  static async enrollStudentToClass(
    organizationId: string,
    userId: string,
    classId: string,
    input: { name: string; email: string; phone?: string }
  ) {
    // Verify the class belongs to the org
    const cls = await getTenantDb().class.findFirst({
      where: { id: classId, course: { organizationId } },
      include: { course: true },
    });
    if (!cls) return { success: false, error: "Không tìm thấy lớp học" };

    const { email, name, phone } = input;
    if (!email || !name) return { success: false, error: "Vui lòng nhập họ tên và email" };

    // ── Step 1: Find or create User ──────────────────────
    const existingUser = await getTenantDb().user.findUnique({ where: { email } });
    const isNewUser = !existingUser;

    let user: typeof existingUser & { id: string; email: string; name: string };

    if (isNewUser) {
      user = await getTenantDb().user.create({
        data: {
          email,
          name,
          phone: phone || null,
          role: "CUSTOMER",
          isActive: true,
        },
      });
    } else {
      // Update name/phone if provided
      user = await getTenantDb().user.update({
        where: { id: existingUser!.id },
        data: {
          name: name || existingUser!.name,
          phone: phone || existingUser!.phone,
        },
      });
    }

    // Ensure org membership
    await getTenantDb().organizationMember.upsert({
      where: { organizationId_userId: { organizationId, userId: user.id } },
      create: { organizationId, userId: user.id, role: "MEMBER" },
      update: {},
    });

    // ── Step 2: Create or update Enrollment ──────────────
    const existingEnrollment = await getTenantDb().enrollment.findUnique({
      where: { courseId_studentId: { courseId: cls.courseId, studentId: user.id } },
    });

    let enrollmentId: string;

    if (existingEnrollment) {
      // Update classId if different
      if (existingEnrollment.classId !== classId) {
        await getTenantDb().enrollment.update({
          where: { id: existingEnrollment.id },
          data: { classId },
        });
      }
      enrollmentId = existingEnrollment.id;
    } else {
      const enrollment = await getTenantDb().enrollment.create({
        data: {
          courseId: cls.courseId,
          classId,
          studentId: user.id,
          status: "PENDING",
          tuitionFee: cls.course.price,
          paymentStatus: "unpaid",
        },
      });
      enrollmentId = enrollment.id;
    }

    // ── Step 3: Sync Finance Invoice ──────────────────────
    const syncRes = await syncTuitionInvoiceForSession(enrollmentId, {
      organizationId,
      userId,
    });

    // ── Step 4: Send Portal credentials email ─────────────
    const password = randomPassword();
    await sendPortalAccessEmailForUser(user.id, password, "/student").catch((e) =>
      console.error("sendPortalAccessEmailForUser error:", e)
    );

    // ── Step 5: Send Enrollment Confirmation email ─────────
    await sendEnrollmentConfirmationEmail({
      organizationId,
      studentName: user.name,
      studentEmail: user.email,
      courseName: cls.course.title,
      className: cls.name,
      tuitionFee: Number(cls.course.price),
      invoiceToken: syncRes.invoiceToken,
    });

    return {
      success: true,
      invoiceToken: syncRes.invoiceToken,
      isNewUser,
      studentId: user.id,
    };
  }
}
