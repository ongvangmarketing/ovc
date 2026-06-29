/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { SignDocumentClient } from "./sign-client";
import { DocumentA4Preview } from "@/modules/finance/components/document-a4-preview";

export default async function DocumentPage({ params }: { params: Promise<{ token: string }> }) {
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl relative">
        <DocumentA4Preview data={doc} type={docType} />

        <div className="mt-8 bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 p-8">
          <SignDocumentClient docType={docType} token={token} isSigned={Boolean(doc.signedAt)} signedAt={doc.signedAt} />
        </div>
      </div>
    </div>
  );
}
