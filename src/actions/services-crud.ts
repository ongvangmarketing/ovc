"use server";

import type { Prisma } from "@prisma/client";

import { getTenantDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";

// --- SERVICES ---

type SerializableRecord = Record<string, unknown> & {
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

type ServiceOptionRecord = SerializableRecord & {
  price?: unknown;
};

type ServiceRecord = SerializableRecord & {
  category?: SerializableRecord | null;
  options?: ServiceOptionRecord[] | null;
};

function serializeDate(value: Date | string | null | undefined) {
  return value instanceof Date ? value.toISOString() : value;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected error";
}

function serializeServiceOption(option: ServiceOptionRecord) {
  return {
    ...option,
    price: Number(option.price ?? 0),
    createdAt: serializeDate(option.createdAt),
    updatedAt: serializeDate(option.updatedAt),
  };
}

function serializeService(service: ServiceRecord) {
  return {
    ...service,
    createdAt: serializeDate(service.createdAt),
    updatedAt: serializeDate(service.updatedAt),
    category: service.category
      ? {
          ...service.category,
          createdAt: serializeDate(service.category.createdAt),
          updatedAt: serializeDate(service.category.updatedAt),
        }
      : service.category,
    options: service.options?.map(serializeServiceOption) ?? service.options,
  };
}

export async function getServices() {
  const session = await requireAuth();
  
  try {
    const services = await getTenantDb().service.findMany({
      where: { organizationId: session.organizationId },
      include: {
        category: true,
        options: true,
      },
      orderBy: { sortOrder: "asc" }
    });
    return { success: true, services: services.map(serializeService) };
  } catch (error: unknown) {
    return { error: errorMessage(error) };
  }
}

export async function getService(id: string) {
  const session = await requireAuth();
  
  try {
    const service = await getTenantDb().service.findUnique({
      where: { id, organizationId: session.organizationId },
      include: {
        options: {
          orderBy: { sortOrder: "asc" }
        }
      }
    });
    if (!service) return { error: "Service not found" };
    return { success: true, service: serializeService(service) };
  } catch (error: unknown) {
    return { error: errorMessage(error) };
  }
}

export async function createService(data: Omit<Prisma.ServiceUncheckedCreateInput, "organizationId" | "createdBy">) {
  const session = await requireAuth();
  
  try {
    const service = await getTenantDb().service.create({
      data: {
        ...data,
        organizationId: session.organizationId,
        createdBy: session.user.id,
      }
    });
    revalidatePath("/workspace/services");
    return { success: true, service: serializeService(service) };
  } catch (error: unknown) {
    return { error: errorMessage(error) };
  }
}

export async function updateService(id: string, data: Prisma.ServiceUncheckedUpdateInput) {
  const session = await requireAuth();
  
  try {
    const service = await getTenantDb().service.update({
      where: { id, organizationId: session.organizationId },
      data
    });
    revalidatePath("/workspace/services");
    revalidatePath(`/workspace/services/${id}/edit`);
    return { success: true, service: serializeService(service) };
  } catch (error: unknown) {
    return { error: errorMessage(error) };
  }
}

export async function deleteService(id: string) {
  const session = await requireAuth();
  
  try {
    await getTenantDb().service.delete({
      where: { id, organizationId: session.organizationId }
    });
    revalidatePath("/workspace/services");
    return { success: true };
  } catch (error: unknown) {
    return { error: errorMessage(error) };
  }
}

// --- SERVICE OPTIONS ---

export async function createServiceOption(serviceId: string, data: Omit<Prisma.ServiceOptionUncheckedCreateInput, "organizationId" | "serviceId">) {
  const session = await requireAuth();
  
  try {
    const option = await getTenantDb().serviceOption.create({
      data: {
        ...data,
        organizationId: session.organizationId,
        serviceId,
      }
    });
    revalidatePath(`/workspace/services/${serviceId}/edit`);
    return { success: true, option: serializeServiceOption(option) };
  } catch (error: unknown) {
    return { error: errorMessage(error) };
  }
}

export async function updateServiceOption(id: string, data: Prisma.ServiceOptionUncheckedUpdateInput) {
  const session = await requireAuth();
  
  try {
    const option = await getTenantDb().serviceOption.update({
      where: { id, organizationId: session.organizationId },
      data
    });
    revalidatePath(`/workspace/services/${option.serviceId}/edit`);
    return { success: true, option: serializeServiceOption(option) };
  } catch (error: unknown) {
    return { error: errorMessage(error) };
  }
}

export async function deleteServiceOption(id: string) {
  const session = await requireAuth();
  
  try {
    const option = await getTenantDb().serviceOption.findUnique({ where: { id } });
    if (!option) return { error: "Not found" };
    
    await getTenantDb().serviceOption.delete({
      where: { id, organizationId: session.organizationId }
    });
    revalidatePath(`/workspace/services/${option.serviceId}/edit`);
    return { success: true };
  } catch (error: unknown) {
    return { error: errorMessage(error) };
  }
}
