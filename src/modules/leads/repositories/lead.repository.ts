import { getTenantDb } from "@/lib/db";
import { Prisma, LeadStatus } from "@prisma/client";

export class LeadRepository {
  static async count(where: Prisma.LeadWhereInput) {
    return await getTenantDb().lead.count({ where });
  }

  static async findMany(args: Prisma.LeadFindManyArgs) {
    return await getTenantDb().lead.findMany(args);
  }

  static async groupByStatus(where: Prisma.LeadWhereInput) {
    return await getTenantDb().lead.groupBy({
      by: ['status'],
      where,
      _count: { _all: true }
    });
  }

  static async findFirst(where: Prisma.LeadWhereInput) {
    return await getTenantDb().lead.findFirst({ where });
  }

  static async findById(id: string) {
    return await getTenantDb().lead.findUnique({ where: { id } });
  }

  static async create(data: Prisma.LeadUncheckedCreateInput) {
    return await getTenantDb().lead.create({ data });
  }

  static async update(id: string, data: Prisma.LeadUncheckedUpdateInput) {
    return await getTenantDb().lead.update({ where: { id }, data });
  }

  static async createDuplicateLog(data: Prisma.LeadDuplicateLogUncheckedCreateInput) {
    return await getTenantDb().leadDuplicateLog.create({ data });
  }

  // transaction for conversion
  static async executeTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
    return await getTenantDb().$transaction(fn);
  }
}
