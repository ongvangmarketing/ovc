import { db } from '../src/lib/db';
import { randomUUID } from 'crypto';

async function backfill() {
  const quotations = await db.quotation.findMany({ where: { token: null } });
  for (const q of quotations) {
    await db.quotation.update({ where: { id: q.id }, data: { token: randomUUID() } });
  }

  const contracts = await db.contract.findMany({ where: { token: null } });
  for (const c of contracts) {
    await db.contract.update({ where: { id: c.id }, data: { token: randomUUID() } });
  }

  const invoices = await db.invoice.findMany({ where: { token: null } });
  for (const i of invoices) {
    await db.invoice.update({ where: { id: i.id }, data: { token: randomUUID() } });
  }
  console.log('Done backfilling tokens');
}
backfill();
