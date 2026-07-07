import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getTrainingTuitionDetail } from "@/lib/training";
import { legacyTuitionInvoiceNumber } from "@/lib/training/tuition-finance";
import { TuitionDetailWorkspace } from "./tuition-detail-workspace";

export const metadata: Metadata = { title: "Biên lai học phí | Ong Vàng" };
export const dynamic = "force-dynamic";

export default async function TuitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getTrainingTuitionDetail(id);
  
  if (!item) notFound();

  const { db } = await import("@/lib/db");
  const invoice = await db.invoice.findFirst({
    where: {
      organizationId: item.course.organizationId,
      OR: [
        { number: legacyTuitionInvoiceNumber(item.id) },
        {
          number: { startsWith: "HP-" },
          title: `Học phí: ${item.course.title}`,
          contact: { email: item.student.email },
        },
      ],
    },
  });

  // Convert Decimals to numbers for client component
  const data = {
    id: item.id,
    student: {
      id: item.student.id,
      name: item.student.name,
      email: item.student.email,
      phone: item.student.phone,
    },
    course: {
      id: item.course.id,
      title: item.course.title,
      price: item.course.price ? Number(item.course.price) : 0,
    },
    class: item.class ? {
      id: item.class.id,
      name: item.class.name,
    } : null,
    tuitionFee: Number(item.tuitionFee),
    paidAmount: Number(item.paidAmount),
    paymentStatus: item.paymentStatus,
    paymentNote: item.paymentNote,
    status: item.status,
    progress: item.progress,
    createdAt: item.createdAt,
    financeInvoiceId: invoice?.id || null,
  };

  return <TuitionDetailWorkspace initialData={data} />;
}
