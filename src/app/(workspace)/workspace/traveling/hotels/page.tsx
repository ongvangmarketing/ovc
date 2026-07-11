import { requireAuth } from "@/lib/auth/require-auth";
import { TravelingService } from "@/modules/traveling/services/traveling.service";
import HotelsClient from "@/modules/traveling/components/hotels-client";

export default async function HotelsManagementPage() {
  let authData;
  try {
    authData = await requireAuth();
  } catch {
    // handled by layout
  }

  if (!authData) return null;

  const hotels = await TravelingService.getHotels(authData.organizationId);

  return <HotelsClient initialHotels={hotels} />;
}
