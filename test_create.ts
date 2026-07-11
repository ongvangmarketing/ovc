import { ConversationService } from './src/modules/business-chat/services/conversation.service'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const orgId = "cm1eim98r0002um58f8v29j46" // Random valid cuid
  const user1 = "user1"
  const user2 = "user2"

  try {
    const res = await ConversationService.createDirectChat(orgId, user1, user2)
    console.log(res)
  } catch(e) {
    console.error(e)
  }
}
main().finally(() => prisma.$disconnect())
