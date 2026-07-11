"use server";

import { getTenantDb } from "@/lib/db";
import { assertLicensedModule } from "@/lib/modules/guards";
import { revalidatePath } from "next/cache";

const requireProjectsSession = () => assertLicensedModule("PROJECTS");

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Có lỗi xảy ra";
}

const fullInclude = {
  author: { select: { name: true, image: true } },
  campaign: true,
  brand: true,
  client: true,
  landingPage: true,
  socialAsset: true,
  aiPrompt: true,
  designer: { select: { name: true, image: true } },
  writer: { select: { name: true, image: true } },
  reviewer: { select: { name: true, image: true } },
  publisher: { select: { name: true, image: true } },
  taxonomies: { include: { taxonomy: true } },
  mediaAssets: { include: { media: true } },
  reports: true,
};

export async function getContentPlans(projectId: string) {
  const session = await requireProjectsSession();
  try {
    const plans = await getTenantDb().contentPlan.findMany({
      where: {
        organizationId: session.organizationId,
        projectId,
      },
      orderBy: { scheduledAt: "asc" },
      include: fullInclude,
    });
    return { success: true, data: plans };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export type CreateContentPlanInput = {
  title: string;
  description?: string;
  channels: string[];
  scheduledAt?: string;
  campaignId?: string;
  brandId?: string;
  clientId?: string;
  landingPageId?: string;
  socialAssetId?: string;
  aiPromptId?: string;
  designerId?: string;
  writerId?: string;
  reviewerId?: string;
  publisherId?: string;
  taxonomyIds?: string[];
  mediaIds?: string[];
};

export async function createContentPlan(projectId: string, data: CreateContentPlanInput) {
  const session = await requireProjectsSession();
  try {
    const newPlan = await getTenantDb().contentPlan.create({
      data: {
        organizationId: session.organizationId,
        projectId,
        title: data.title,
        description: data.description,
        channels: data.channels,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        authorId: session.user.id,
        campaignId: data.campaignId,
        brandId: data.brandId,
        clientId: data.clientId,
        landingPageId: data.landingPageId,
        socialAssetId: data.socialAssetId,
        aiPromptId: data.aiPromptId,
        designerId: data.designerId,
        writerId: data.writerId,
        reviewerId: data.reviewerId,
        publisherId: data.publisherId,
        taxonomies: data.taxonomyIds ? {
          create: data.taxonomyIds.map(id => ({ taxonomyId: id }))
        } : undefined,
        mediaAssets: data.mediaIds ? {
          create: data.mediaIds.map(id => ({ mediaId: id }))
        } : undefined,
      },
      include: fullInclude,
    });
    revalidatePath(`/workspace/projects/${projectId}`);
    return { success: true, data: newPlan };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export type UpdateContentPlanInput = Partial<CreateContentPlanInput> & { clientStatus?: string; status?: any };

export async function updateContentPlan(id: string, data: UpdateContentPlanInput) {
  const session = await requireProjectsSession();
  try {
    const plan = await getTenantDb().contentPlan.findUnique({ where: { id } });
    if (!plan || plan.organizationId !== session.organizationId) {
      throw new Error("Không tìm thấy bài viết");
    }
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.channels !== undefined) updateData.channels = data.channels;
    if (data.scheduledAt !== undefined) updateData.scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
    if (data.clientStatus !== undefined) updateData.clientStatus = data.clientStatus;
    if (data.status !== undefined) updateData.status = data.status;
    
    if (data.campaignId !== undefined) updateData.campaignId = data.campaignId;
    if (data.brandId !== undefined) updateData.brandId = data.brandId;
    if (data.clientId !== undefined) updateData.clientId = data.clientId;
    if (data.landingPageId !== undefined) updateData.landingPageId = data.landingPageId;
    if (data.socialAssetId !== undefined) updateData.socialAssetId = data.socialAssetId;
    if (data.aiPromptId !== undefined) updateData.aiPromptId = data.aiPromptId;
    
    if (data.designerId !== undefined) updateData.designerId = data.designerId;
    if (data.writerId !== undefined) updateData.writerId = data.writerId;
    if (data.reviewerId !== undefined) updateData.reviewerId = data.reviewerId;
    if (data.publisherId !== undefined) updateData.publisherId = data.publisherId;

    if (data.taxonomyIds !== undefined) {
      updateData.taxonomies = {
        deleteMany: {},
        create: data.taxonomyIds.map(tid => ({ taxonomyId: tid }))
      };
    }
    
    if (data.mediaIds !== undefined) {
      updateData.mediaAssets = {
        deleteMany: {},
        create: data.mediaIds.map(mid => ({ mediaId: mid }))
      };
    }

    const updated = await getTenantDb().contentPlan.update({
      where: { id },
      data: updateData,
      include: fullInclude,
    });
    
    if (plan.projectId) {
      revalidatePath(`/workspace/projects/${plan.projectId}`);
    }
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteContentPlan(id: string) {
  const session = await requireProjectsSession();
  try {
    const plan = await getTenantDb().contentPlan.findUnique({ where: { id } });
    if (!plan || plan.organizationId !== session.organizationId) {
      throw new Error("Không tìm thấy bài viết");
    }
    await getTenantDb().contentPlan.delete({ where: { id } });
    if (plan.projectId) {
      revalidatePath(`/workspace/projects/${plan.projectId}`);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
