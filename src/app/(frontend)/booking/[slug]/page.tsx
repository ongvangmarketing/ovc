import { HotelService } from "@/modules/traveling/services/hotel.service";
import { notFound } from "next/navigation";
import BookingEngine from "../components/BookingEngine";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await HotelService.getPublicHotelBySlug(slug);
  
  if (!hotel) return { title: "Không tìm thấy khách sạn" };
  
  return {
    title: `Đặt phòng ${hotel.name} - Official Booking`,
    description: hotel.description || `Đặt phòng tại ${hotel.name} với giá tốt nhất.`,
  };
}

export default async function BookingPageBySlug({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const hotel = await HotelService.getPublicHotelBySlug(slug);

  if (!hotel) notFound();

  const roomTypes = await HotelService.getPublicRoomTypes(hotel.id);

  return <BookingEngine hotel={hotel as any} roomTypes={roomTypes} />;
}
