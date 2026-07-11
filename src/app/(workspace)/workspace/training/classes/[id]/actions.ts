"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/require-auth";
import { ClassEnrollmentService } from "@/modules/training/services/class-enrollment.service";

export async function enrollStudentToClass(
  classId: string,
  input: { name: string; email: string; phone?: string }
): Promise<{
  success: boolean;
  error?: string;
  invoiceToken?: string | null;
  isNewUser?: boolean;
  studentId?: string;
}> {
  try {
    const session = await requireAuth();

    const result = await ClassEnrollmentService.enrollStudentToClass(
      session.organizationId,
      session.userId,
      classId,
      input
    );

    if (result.success) {
      revalidatePath(`/workspace/training/classes/${classId}`);
      revalidatePath("/workspace/training/tuition");
    }

    return result;
  } catch (error) {
    console.error("enrollStudentToClass error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Có lỗi xảy ra",
    };
  }
}
