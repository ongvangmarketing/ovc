import { requireAuth } from "@/lib/auth/require-auth";
import VehiclesClient from "./vehicles-client";
import { VehicleService } from "@/modules/traveling/services/vehicle.service";

export default async function VehiclesManagementPage() {
  let authData;
  try {
    authData = await requireAuth();
  } catch {
    // handled by layout
  }

  if (!authData) return null;

  const vehicles = await VehicleService.getVehicles(authData.organizationId);

  return <VehiclesClient initialVehicles={vehicles} />;
}
