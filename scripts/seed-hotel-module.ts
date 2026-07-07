import { db } from '../src/lib/db';

async function main() {
  await db.platformModule.upsert({
    where: { code: 'HOTEL_BOOKING' },
    update: {
      name: 'Hotel Booking',
      description: 'Hệ thống quản lý đặt phòng và phân phối đa kênh',
      status: 'ACTIVE',
      sortOrder: 15,
    },
    create: {
      code: 'HOTEL_BOOKING',
      name: 'Hotel Booking',
      description: 'Hệ thống quản lý đặt phòng và phân phối đa kênh',
      status: 'ACTIVE',
      sortOrder: 15,
    },
  });
  console.log('Successfully seeded HOTEL_BOOKING module');
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
