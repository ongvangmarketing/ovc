import { db } from './src/lib/db';

async function run() {
  const org = await db.organization.findFirst({ where: { slug: 'ovmain' } });
  if (!org) return;

  let user = await db.user.findUnique({ where: { email: 'trungongvang@gmail.com' } });
  let contact = await db.contact.findFirst({ where: { email: 'trungongvang@gmail.com', organizationId: org.id } });

  const projects = await db.project.findMany({ where: { ownerId: user.id } });
  for (const p of projects) {
    await db.$executeRaw`
        INSERT INTO "invoices" (id, "organizationId", "contactId", "projectId", "creatorId", "number", "title", "status", "total", "amountDue", "dueDate", "token", "updatedAt") 
        VALUES (gen_random_uuid()::text, ${org.id}, ${contact.id}, ${p.id}, ${user.id}, ${'INV-2026-X' + Math.floor(Math.random() * 10000)}, ${'Thanh toán ' + p.name}, 'SENT', 15000000, 15000000, NOW() + interval '5 days', ${'tok_' + Math.random()}, NOW())
    `;
  }

  console.log("Seed completed successfully!");
}

run().catch(console.error);
