import { requireAuth } from "@/lib/auth/require-auth";
import HotelsClient from "./hotels-client";
import { HotelService } from "@/modules/traveling/services/hotel.service";

export default async function HotelsManagementPage() {
  let authData;
  try {
    authData = await requireAuth();
  } catch {
    // handled by layout
  }

  if (!authData) return null;

  const hotels = await HotelService.getHotels(authData.organizationId);

  return <HotelsClient initialHotels={hotels} />;
}
