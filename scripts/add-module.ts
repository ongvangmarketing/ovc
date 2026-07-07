import { db } from '../src/lib/db';

async function main() {
  const orgs = await db.organization.findMany();
  let count = 0;
  for (const org of orgs) {
    if (!org.activeModules.includes('HOTEL_BOOKING')) {
      await db.organization.update({
        where: { id: org.id },
        data: { activeModules: { push: 'HOTEL_BOOKING' } }
      });
      count++;
      console.log(`Added HOTEL_BOOKING to org: ${org.name}`);
    }
  }
  console.log(`Updated ${count} organizations.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
