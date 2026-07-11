import { PrismaClient } from '@prisma/client'
const client = new PrismaClient()
console.log(Object.keys(client).filter(k => k.toLowerCase().includes('chat')))
