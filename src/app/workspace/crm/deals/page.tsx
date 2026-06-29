import type { Metadata } from "next";
import { DealsClient } from "@/modules/crm/components/deals-client";

export const metadata: Metadata = {
  title: "Cơ hội",
};

export default function DealsPage() {
  return <DealsClient />;
}
