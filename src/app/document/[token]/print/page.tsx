/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db";
import { DocumentA4Preview } from "@/modules/finance/components/document-a4-preview";
import { notFound } from "next/navigation";

export default async function PrintDocumentPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let docType: "quotation" | "contract" | "invoice" | null = null;
  let doc: any = null;

  const includeDocumentData = {
    items: true,
    organization: true,
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

  return (
    <div className="min-h-screen bg-gray-100">
      <DocumentA4Preview data={doc} type={docType} />
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          html, body { margin: 0; background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .document-a4-wrapper { padding: 0 !important; background: white !important; }
          .document-a4-wrapper .sheet { box-shadow: none !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
}
