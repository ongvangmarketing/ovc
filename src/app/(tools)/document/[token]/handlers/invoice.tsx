import { getTenantDb } from "@/lib/db";
import { notifyFinanceDocumentEvent } from "@/lib/notifications/finance";
import { DocumentA4Preview } from "@/modules/finance/components/document-a4-preview";
import { DocumentModernPreview } from "@/modules/finance/components/document-modern-preview";
import { DocumentTuitionPreview } from "@/modules/finance/components/document-tuition-preview";
import { SignDocumentClient } from "../sign-client";
import { PaymentClient } from "../payment-client";

export async function InvoiceHandler({ token }: { token: string }) {
  const doc = await getTenantDb().invoice.findUnique({
    where: { token },
    include: {
      items: true,
      organization: { include: { settings: true } },
      contact: { include: { company: true } },
      signature: true,
    },
  });

  if (!doc) return null;

  const customerName = doc.contact?.company?.name || [doc.contact?.firstName, doc.contact?.lastName].filter(Boolean).join(" ").trim() || doc.contact?.email || "Khách hàng";
  await notifyFinanceDocumentEvent({
    organizationId: doc.organizationId,
    type: "invoice",
    id: doc.id,
    number: doc.number,
    customerName,
    event: "viewed",
    metadata: { token },
    dedupeMinutes: 15,
  }).catch(() => {});

  if (doc.status === "SENT") {
    await getTenantDb().invoice.update({ where: { id: doc.id }, data: { status: "VIEWED" } }).catch(() => {});
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const companySettings = Object.fromEntries((Array.isArray(doc.organization?.settings) ? doc.organization.settings : []).map((item: any) => [item.key, item.value || '']));
  const isTuition = doc.number?.startsWith("HP-") || doc.title?.startsWith("Học phí:");
  const isModern = isTuition || companySettings.FINANCE_DOCUMENT_TEMPLATE === "MODERN";
  const type = "invoice";

  return (
    <div className={isModern ? "min-h-screen bg-[#f7f9fc]" : "min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50"}>
      <div className={`w-full relative ${isModern ? '' : 'max-w-4xl'}`}>
        {isTuition ? (
          <DocumentTuitionPreview
            data={doc}
            type={type}
            paymentSlot={<PaymentClient invoiceNumber={doc.number} amountDue={Number(doc.amountDue)} />}
            signatureSlot={
              doc.customerSignatureRequired !== false ? (
                <SignDocumentClient docType={type} token={token} isSigned={Boolean(doc.signedAt)} signedAt={doc.signedAt} />
              ) : null
            }
          />
        ) : isModern ? (
          <DocumentModernPreview
            data={doc}
            type={type}
            token={token}
            signatureSlot={
              doc.customerSignatureRequired !== false ? (
                <SignDocumentClient docType={type} token={token} isSigned={Boolean(doc.signedAt)} signedAt={doc.signedAt} />
              ) : null
            }
          />
        ) : (
          <>
            <DocumentA4Preview data={doc} type={type} />
            {doc.customerSignatureRequired !== false && (
              <div className="mt-6 bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 p-5 sm:p-6 max-w-4xl mx-auto">
                <SignDocumentClient docType={type} token={token} isSigned={Boolean(doc.signedAt)} signedAt={doc.signedAt} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
