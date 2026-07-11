import { requireAuth } from "@/lib/auth/require-auth";
import ToursClient from "@/modules/traveling/components/tours-client";
import { TravelingService } from "@/modules/traveling/services/traveling.service";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Tour",
};

export default async function ToursManagementPage() {
  let authData;
  try {
    authData = await requireAuth();
  } catch {
    // handled by layout
  }

  if (!authData) return null;

  const tours = await TravelingService.getTours(authData.organizationId);

  return <ToursClient initialTours={tours} />;
}
