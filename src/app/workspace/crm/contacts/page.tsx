import type { Metadata } from "next";
import { ContactsClient } from "@/modules/crm/components/contacts-client";

export const metadata: Metadata = {
  title: "Liên hệ",
};

export default function ContactsPage() {
  return <ContactsClient />;
}
