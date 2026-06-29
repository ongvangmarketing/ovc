import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "CRM" };

export default function CRMPage() {
  redirect("/workspace/crm/contacts");
}
