import { requireAuth } from "@/lib/auth/require-auth";
import ToursClient from "./tours-client";
import { redirect } from "next/navigation";
import { TourService } from "@/modules/traveling/services/tour.service";

export default async function ToursManagementPage() {
  let authData;
  try {
    authData = await requireAuth();
  } catch {
    // handled by layout
  }

  if (!authData) return null;

  const tours = await TourService.getTours(authData.organizationId);

  return <ToursClient initialTours={tours} />;
}
