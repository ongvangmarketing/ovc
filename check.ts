import { PrismaClient } from "@prisma/client";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const prisma = new PrismaClient();
async function main() {
  const t = await prisma.emailTemplate.findFirst({ where: { code: 'SEND_QUOTATION' } });
  console.log("BODY:", t?.body);
}
main();
