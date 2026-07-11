import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Hotels...");

  const org = await prisma.organization.findUnique({ where: { slug: "ovmain" } });
  if (!org) {
    console.error("Organization 'ovmain' not found!");
    return;
  }

  // Khách sạn 1: Mường Thanh Đà Lạt
  const hotel1 = await prisma.hotel.upsert({
    where: { slug: "muong-thanh-da-lat" },
    update: {},
    create: {
      organizationId: org.id,
      name: "Khách sạn Mường Thanh Đà Lạt",
      slug: "muong-thanh-da-lat",
      description: "Khách sạn đạt chuẩn 4 sao tọa lạc tại trung tâm thành phố ngàn hoa Đà Lạt, ngay cạnh Hồ Xuân Hương thơ mộng.",
      address: "42 Phan Bội Châu",
      city: "Đà Lạt",
      starRating: 4,
      logo: "https://images.unsplash.com/photo-1542314831-c6a4d14eff43?q=80&w=2070&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1542314831-c6a4d14eff43?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070&auto=format&fit=crop"
      ]
    }
  });

  // Hạng phòng Hotel 1
  const h1_rt1 = await prisma.roomType.create({
    data: {
      hotelId: hotel1.id,
      name: "Standard Double",
      description: "Phòng tiêu chuẩn giường đôi, diện tích 25m2, view thành phố.",
      capacity: 2,
      basePrice: 850000,
      images: ["https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070&auto=format&fit=crop"]
    }
  });

  const h1_rt2 = await prisma.roomType.create({
    data: {
      hotelId: hotel1.id,
      name: "Deluxe Lake View",
      description: "Phòng cao cấp giường đôi, diện tích 35m2, ban công view Hồ Xuân Hương.",
      capacity: 2,
      basePrice: 1500000,
      images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop"]
    }
  });

  // Số phòng Hotel 1 (3 phòng)
  await prisma.room.createMany({
    data: [
      { roomTypeId: h1_rt1.id, roomNumber: "101", status: "AVAILABLE" },
      { roomTypeId: h1_rt1.id, roomNumber: "102", status: "OCCUPIED" },
      { roomTypeId: h1_rt2.id, roomNumber: "201", status: "MAINTENANCE" }
    ]
  });

  // Khách sạn 2: Vinpearl Resort Nha Trang
  const hotel2 = await prisma.hotel.upsert({
    where: { slug: "vinpearl-nha-trang" },
    update: {},
    create: {
      organizationId: org.id,
      name: "Vinpearl Resort Nha Trang",
      slug: "vinpearl-nha-trang",
      description: "Khu nghỉ dưỡng 5 sao sang trọng bậc nhất tại đảo Hòn Tre, Nha Trang.",
      address: "Đảo Hòn Tre, Phường Vĩnh Nguyên",
      city: "Nha Trang",
      starRating: 5,
      logo: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=2070&auto=format&fit=crop"
      ]
    }
  });

  // Hạng phòng Hotel 2
  const h2_rt1 = await prisma.roomType.create({
    data: {
      hotelId: hotel2.id,
      name: "Ocean View Villa",
      description: "Biệt thự hướng biển có hồ bơi riêng, lý tưởng cho gia đình nhỏ.",
      capacity: 4,
      basePrice: 5500000,
      images: ["https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=2070&auto=format&fit=crop"]
    }
  });

  // Số phòng Hotel 2 (3 phòng)
  await prisma.room.createMany({
    data: [
      { roomTypeId: h2_rt1.id, roomNumber: "VILLA-01", status: "AVAILABLE" },
      { roomTypeId: h2_rt1.id, roomNumber: "VILLA-02", status: "AVAILABLE" },
      { roomTypeId: h2_rt1.id, roomNumber: "VILLA-03", status: "OCCUPIED" }
    ]
  });

  console.log("Seeded 2 Hotels, Room Types, and Rooms successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
