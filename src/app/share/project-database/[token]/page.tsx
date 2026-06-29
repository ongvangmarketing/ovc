import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicDatabaseByToken } from "@/modules/projects/actions/project-database.actions";

export const metadata: Metadata = {
  title: "Project Database Share",
};

export default async function PublicProjectDatabasePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getPublicDatabaseByToken(token).catch(() => null);

  if (!data) notFound();

  const fields = data.database.fields;
  const records = data.database.records;

  return (
    <main className="min-h-screen bg-[#f8fafc] p-6">
      <section className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-500">Public Project Database</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">{data.database.name}</h1>
            <p className="mt-1 text-sm text-slate-500">{data.database.description || "Dữ liệu chia sẻ từ Ong Vàng Workspace."}</p>
          </div>
          {data.share.allowEdit ? (
            <Link href={`/share/project-database/${token}/form`} className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white">
              Gửi bản ghi
            </Link>
          ) : null}
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {fields.map((field) => <th key={field.id} className="px-4 py-3">{field.name}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((record) => {
                const values = record.values as Record<string, unknown>;
                return (
                  <tr key={record.id}>
                    {fields.map((field) => (
                      <td key={field.id} className="px-4 py-3 text-slate-700">
                        {formatPublicValue(values[field.key])}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {!records.length ? (
                <tr>
                  <td colSpan={Math.max(fields.length, 1)} className="px-4 py-10 text-center text-slate-500">Chưa có dữ liệu được chia sẻ.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function formatPublicValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
