import type { Metadata } from "next";
import { ContactsClient } from "@/modules/crm/components/contacts-client";

export const metadata: Metadata = {
  title: "Liên hệ",
};

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans pb-20 animate-in fade-in duration-300">
      <ContactsClient />
    </div>
  );
}
