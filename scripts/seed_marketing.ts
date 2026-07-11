import { config } from 'dotenv';
config({ path: '.env.local' });
import { db as prisma } from '../src/lib/db';

async function main() {
  const projectId = 'cmr32wnkh0000dlm960hmd9y0';
  const orgId = 'org_main';

  // 1. Get Project and User
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    console.error("Project not found!");
    return;
  }
  
  const user = await prisma.user.findFirst({
    where: { 
      memberships: { some: { organizationId: orgId } } 
    }
  });

  if (!user) {
    console.error("No user found in org_main!");
    return;
  }
  
  const authorId = user.id;

  // 2. Create Brand
  const brand = await prisma.brand.create({
    data: {
      organizationId: orgId,
      name: 'EcoSmart Tech',
      description: 'Công ty công nghệ xanh'
    }
  });

  // 3. Create Campaign
  const campaign = await prisma.campaign.create({
    data: {
      organizationId: orgId,
      name: 'Chiến dịch Ra mắt Sản phẩm Mới Q3',
      description: 'Đẩy mạnh truyền thông cho sản phẩm EcoHome'
    }
  });

  // 4. Create Taxonomies
  const funnelTop = await prisma.taxonomy.create({
    data: { organizationId: orgId, type: 'FUNNEL', name: 'Awareness (Top)', color: '#3b82f6' }
  });
  const pillarTech = await prisma.taxonomy.create({
    data: { organizationId: orgId, type: 'CONTENT_PILLAR', name: 'Technology & Innovation', color: '#8b5cf6' }
  });
  const personaMom = await prisma.taxonomy.create({
    data: { organizationId: orgId, type: 'PERSONA', name: 'Tech-savvy Moms', color: '#ec4899' }
  });

  // 5. Create Content Plans
  const today = new Date();
  
  await prisma.contentPlan.create({
    data: {
      organizationId: orgId,
      projectId: projectId,
      title: 'Giới thiệu giải pháp EcoHome',
      description: 'Bài đăng Facebook giới thiệu tổng quan về sản phẩm',
      channels: ['FACEBOOK'],
      scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
      status: 'DRAFT',
      authorId: authorId,
      brandId: brand.id,
      campaignId: campaign.id,
      designerId: authorId,
      taxonomies: {
        create: [
          { taxonomyId: funnelTop.id },
          { taxonomyId: pillarTech.id }
        ]
      }
    }
  });

  await prisma.contentPlan.create({
    data: {
      organizationId: orgId,
      projectId: projectId,
      title: 'Video Demo tính năng',
      description: 'Video ngắn Tiktok hướng dẫn sử dụng',
      channels: ['TIKTOK'],
      scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
      status: 'IN_PROGRESS',
      authorId: authorId,
      brandId: brand.id,
      campaignId: campaign.id,
      writerId: authorId,
      taxonomies: {
        create: [
          { taxonomyId: personaMom.id }
        ]
      }
    }
  });

  console.log("Seeding marketing content plans completed!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
