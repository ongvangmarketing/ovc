import { db } from '../src/lib/db';

async function main() {
  const org = await db.organization.findFirst({
    where: {
      OR: [
        { slug: 'ovc' },
        { name: { contains: 'OVC' } }
      ]
    }
  });

  if (!org) {
    console.log("No OVC organization found.");
    return;
  }

  const hotel = await db.hotel.upsert({
    where: { slug: 'ovc-hotel' },
    update: {},
    create: {
      organizationId: org.id,
      name: 'OVC Luxury Hotel',
      slug: 'ovc-hotel',
      address: '123 OVC Street, HCMC',
      phone: '0123456789',
      email: 'hotel@ovc.vn',
      checkInTime: '14:00',
      checkOutTime: '12:00'
    }
  });

  const roomType = await db.roomType.upsert({
    where: { hotelId_slug: { hotelId: hotel.id, slug: 'deluxe' } },
    update: {},
    create: {
      hotelId: hotel.id,
      name: 'Deluxe Room',
      slug: 'deluxe',
      capacity: 2,
      basePrice: 1500000,
      weekendPrice: 1800000
    }
  });
  
  const room = await db.room.upsert({
    where: { roomTypeId_roomNumber: { roomTypeId: roomType.id, roomNumber: '101' } },
    update: {},
    create: {
      roomTypeId: roomType.id,
      roomNumber: '101',
      floor: '1'
    }
  });

  console.log(`Successfully seeded hotel ${hotel.name} for organization ${org.name}`);
}

main().catch(console.error).finally(() => db.$disconnect());
