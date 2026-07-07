/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { SignDocumentClient } from "./sign-client";
import { DocumentA4Preview } from "@/modules/finance/components/document-a4-preview";
import { DocumentModernPreview } from "@/modules/finance/components/document-modern-preview";
import { notifyFinanceDocumentEvent } from "@/lib/notifications/finance";

export const dynamic = 'force-dynamic';

export default async function DocumentPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  
  let docType: "quotation" | "contract" | "invoice" | null = null;
  let doc: any = null;

  const includeDocumentData = {
    items: true,
    organization: { include: { settings: true } },
    contact: { include: { company: true } },
    signature: true,
  };

  doc = await db.quotation.findUnique({ where: { token }, include: includeDocumentData });
  if (doc) docType = "quotation";
  else {
    doc = await db.contract.findUnique({ where: { token }, include: includeDocumentData });
    if (doc) docType = "contract";
    else {
      doc = await db.invoice.findUnique({ where: { token }, include: includeDocumentData });
      if (doc) docType = "invoice";
    }
  }

  if (!doc || !docType) return notFound();

  const customerName = doc.contact?.company?.name || [doc.contact?.firstName, doc.contact?.lastName].filter(Boolean).join(" ").trim() || doc.contact?.email || "Khách hàng";
  await notifyFinanceDocumentEvent({
    organizationId: doc.organizationId,
    type: docType,
    id: doc.id,
    number: doc.number,
    customerName,
    event: "viewed",
    metadata: { token },
    dedupeMinutes: 15,
  }).catch((error) => console.error("Không thể tạo thông báo khách xem tài liệu", error));

  if (doc.status === "SENT") {
    await (db as any)[docType].update({
      where: { id: doc.id },
      data: { status: "VIEWED" },
    }).catch(() => {});
  }

  const companySettings = Object.fromEntries(
    (Array.isArray(doc.organization?.settings) ? doc.organization.settings : []).map((item: any) => [item.key, item.value || ''])
  );
  const isModern = companySettings.FINANCE_DOCUMENT_TEMPLATE === "MODERN";

  return (
    <div className={`min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 ${isModern ? 'bg-[#f7f9fc]' : 'bg-gray-50'}`}>
      <div className={`w-full relative ${isModern ? 'max-w-[1440px]' : 'max-w-4xl'}`}>
        
        {isModern ? (
          <DocumentModernPreview data={doc} type={docType} />
        ) : (
          <DocumentA4Preview data={doc} type={docType} />
        )}

        {doc.customerSignatureRequired !== false ? (
          <div className="mt-6 bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 p-5 sm:p-6 max-w-4xl mx-auto">
            <SignDocumentClient docType={docType} token={token} isSigned={Boolean(doc.signedAt)} signedAt={doc.signedAt} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
