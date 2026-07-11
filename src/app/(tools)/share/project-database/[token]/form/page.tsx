import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublicDatabaseByToken } from "@/modules/projects/actions/project-database.actions";
import { PublicProjectDatabaseForm } from "./public-project-database-form";

export const metadata: Metadata = {
  title: "Submit Project Database Record",
};

export default async function PublicProjectDatabaseFormPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getPublicDatabaseByToken(token).catch(() => null);

  if (!data || !data.share.allowEdit) notFound();

  return (
    <main className="min-h-screen bg-[#f8fafc] p-6">
      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-500">Public Form</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">{data.database.name}</h1>
          <p className="mt-1 text-sm text-slate-500">Khách có thể gửi dữ liệu theo quyền share link.</p>
        </div>
        <PublicProjectDatabaseForm token={token} fields={data.database.fields.map((field) => ({
          id: field.id,
          key: field.key,
          name: field.name,
          type: field.type,
          required: field.required,
        }))} requireGuestInfo={data.share.requireGuestInfo} />
      </section>
    </main>
  );
}
