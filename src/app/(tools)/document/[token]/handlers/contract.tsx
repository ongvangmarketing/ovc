import { getTenantDb } from "@/lib/db";
import { notifyFinanceDocumentEvent } from "@/lib/notifications/finance";
import { DocumentA4Preview } from "@/modules/finance/components/document-a4-preview";
import { DocumentModernPreview } from "@/modules/finance/components/document-modern-preview";
import { SignDocumentClient } from "../sign-client";

export async function ContractHandler({ token }: { token: string }) {
  const doc = await getTenantDb().contract.findUnique({
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
    type: "contract",
    id: doc.id,
    number: doc.number,
    customerName,
    event: "viewed",
    metadata: { token },
    dedupeMinutes: 15,
  }).catch(() => {});

  // Contract always uses Modern template according to original logic, or we check settings
  const isModern = true;
  const type = "contract";

  return (
    <div className={isModern ? "min-h-screen bg-[#f7f9fc]" : "min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50"}>
      <div className={`w-full relative ${isModern ? '' : 'max-w-4xl'}`}>
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
      </div>
    </div>
  );
}
