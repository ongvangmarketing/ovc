import { requireAuth } from "@/lib/auth/require-auth";
import { notFound } from "next/navigation";
import ItineraryBuilder from "./itinerary-builder";
import { Metadata } from "next";
import { TourService } from "@/modules/traveling/services/tour.service";

export const metadata: Metadata = {
  title: "Lịch trình Tour",
};

export default async function TourItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const authData = await requireAuth();
  const { id: tourId } = await params;
  
  const tour = await TourService.getTourDetail(authData.organizationId, tourId);

  if (!tour) return notFound();

  return (
    <div className="flex flex-col gap-8 pb-20">
      <ItineraryBuilder tourId={tourId} initialItineraries={tour.itineraries} />
    </div>
  );
}
