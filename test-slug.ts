import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.hotel.findMany().then(h => console.log(h)).finally(() => prisma.$disconnect());
