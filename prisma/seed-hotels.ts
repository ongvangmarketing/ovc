import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding hotels...");
  
  const org = await prisma.organization.findFirst({
    where: { slug: "ong-vang" }
  });

  if (!org) {
    console.log("Could not find ong-vang org.");
    return;
  }

  // Create a hotel
  const hotel = await prisma.hotel.upsert({
    where: { slug: "ong-vang-resort" },
    update: {},
    create: {
      name: "Ong Vàng Resort & Spa",
      slug: "ong-vang-resort",
      organizationId: org.id,
      address: "123 Đường Ven Biển, Nha Trang, Khánh Hoà",
      phone: "0123456789",
      email: "booking@ongvangresort.com",
      checkInTime: "14:00",
      checkOutTime: "12:00",
      status: "ACTIVE",
      roomTypes: {
        create: [
          {
            name: "Standard Room",
            slug: "standard-room",
            description: "Phòng tiêu chuẩn ấm cúng dành cho 2 người.",
            basePrice: 500000,
            baseCapacity: 2,
            maxCapacity: 3,
            totalRooms: 20
          },
          {
            name: "Deluxe Ocean View",
            slug: "deluxe-ocean-view",
            description: "Phòng cao cấp với hướng nhìn ra biển lộng gió.",
            basePrice: 1200000,
            baseCapacity: 2,
            maxCapacity: 4,
            totalRooms: 10
          },
          {
            name: "Presidential Suite",
            slug: "presidential-suite",
            description: "Phòng tổng thống siêu sang trọng với hồ bơi riêng.",
            basePrice: 5000000,
            baseCapacity: 4,
            maxCapacity: 6,
            totalRooms: 2
          }
        ]
      }
    }
  });

  console.log("Created hotel:", hotel.name);
  console.log("Done seeding hotels.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
