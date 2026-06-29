"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updatePublicRecordByToken } from "@/modules/projects/actions/project-database.actions";

type PublicField = {
  id: string;
  key: string;
  name: string;
  type: string;
  required: boolean;
};

export function PublicProjectDatabaseForm({
  token,
  fields,
  requireGuestInfo,
}: {
  token: string;
  fields: PublicField[];
  requireGuestInfo: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [guestInfo, setGuestInfo] = useState({ name: "", email: "" });
  const [recordId, setRecordId] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    if (!recordId.trim()) {
      toast.error("Phase này cần nhập Record ID để sửa public record.");
      return;
    }

    startTransition(async () => {
      const result = await updatePublicRecordByToken(token, {
        recordId: recordId.trim(),
        values,
        guestInfo: requireGuestInfo ? guestInfo : undefined,
      });
      if (result.success) {
        toast.success("Đã lưu dữ liệu");
      } else {
        toast.error(result.error || "Không lưu được dữ liệu");
      }
    });
  };

  return (
    <div className="space-y-4">
      {requireGuestInfo ? (
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">Tên khách</span>
            <input value={guestInfo.name} onChange={(event) => setGuestInfo({ ...guestInfo, name: event.target.value })} className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-orange-400" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">Email khách</span>
            <input value={guestInfo.email} onChange={(event) => setGuestInfo({ ...guestInfo, email: event.target.value })} className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-orange-400" />
          </label>
        </div>
      ) : null}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-600">Record ID cần sửa</span>
        <input value={recordId} onChange={(event) => setRecordId(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-orange-400" placeholder="Dán record id..." />
      </label>

      {fields.map((field) => (
        <label key={field.id} className="block">
          <span className="mb-1 block text-sm font-medium text-slate-600">{field.name}{field.required ? " *" : ""}</span>
          <input
            value={values[field.key] || ""}
            onChange={(event) => setValues({ ...values, [field.key]: event.target.value })}
            className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-orange-400"
            placeholder={field.type}
          />
        </label>
      ))}

      <button type="button" onClick={submit} disabled={isPending} className="h-11 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white disabled:opacity-60">
        {isPending ? "Đang lưu..." : "Lưu dữ liệu"}
      </button>
    </div>
  );
}
