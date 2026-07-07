import "dotenv/config";
import { db as prisma } from "../src/lib/db";

async function main() {
  const orgs = await prisma.organization.findMany();
  for (const org of orgs) {
    const stageCount = await prisma.dealStage.count({
      where: { organizationId: org.id }
    });
    
    console.log(`Org ${org.id}: ${stageCount} stages found.`);

    // Force delete all stages and recreate the 5 required ones
    await prisma.dealStage.deleteMany({
      where: { organizationId: org.id }
    });
    
    await prisma.dealStage.createMany({
      data: [
        { organizationId: org.id, name: "Mới (Lead)", probability: 10, color: "#94A3B8", order: 1, isDefault: true },
        { organizationId: org.id, name: "Tiếp cận (Contacted)", probability: 30, color: "#3B82F6", order: 2, isDefault: false },
        { organizationId: org.id, name: "Đề xuất (Proposal)", probability: 50, color: "#F59E0B", order: 3, isDefault: false },
        { organizationId: org.id, name: "Thương lượng", probability: 80, color: "#8B5CF6", order: 4, isDefault: false },
        { organizationId: org.id, name: "Chốt (Won)", probability: 100, color: "#10B981", order: 5, isDefault: false },
      ]
    });
    console.log(`Force recreated 5 stages for Org ${org.id}`);
    
    // Check old deals without stages
    const deals = await prisma.deal.findMany({
      where: { organizationId: org.id, stageId: null }
    });
    
    if (deals.length > 0) {
      const stages = await prisma.dealStage.findMany({
        where: { organizationId: org.id },
        orderBy: { order: 'asc' }
      });
      if (stages.length > 0) {
        await prisma.deal.updateMany({
          where: { id: { in: deals.map(d => d.id) } },
          data: { stageId: stages[0].id }
        });
        console.log(`Assigned ${deals.length} deals to the first stage.`);
      }
    }
  }

  const allStages = await prisma.dealStage.findMany();
  console.log("Total stages now:", allStages.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
