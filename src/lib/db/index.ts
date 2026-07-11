import { PrismaClient, Prisma } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { getTenantContext } from "./tenant-context";

// Cấu hình TTL (Time To Live) cho mỗi connection (ví dụ 15 phút)
const CONNECTION_TTL_MS = 15 * 60 * 1000;

interface CachedConnection {
  client: PrismaClient;
  timeoutId: NodeJS.Timeout;
  tenantClients?: Map<string, any>;
}

const globalForPrisma = globalThis as unknown as {
  prismaClientPromises?: Map<string, Promise<PrismaClient>>;
  prismaClients?: Map<string, CachedConnection>;
  prisma?: PrismaClient;
};

if (!globalForPrisma.prismaClients) {
  globalForPrisma.prismaClients = new Map<string, CachedConnection>();
  globalForPrisma.prismaClientPromises = new Map<string, Promise<PrismaClient>>();
}

/**
 * Xóa một connection khỏi cache và gọi disconnect để giải phóng bộ nhớ.
 */
async function evictConnection(connectionString: string) {
  const cached = globalForPrisma.prismaClients!.get(connectionString);
  if (cached) {
    clearTimeout(cached.timeoutId);
    globalForPrisma.prismaClients!.delete(connectionString);
    globalForPrisma.prismaClientPromises!.delete(connectionString);
    try {
      await cached.client.$disconnect();
    } catch (e) {
      console.error("[TenantConnectionManager] Lỗi khi disconnect DB:", e);
    }
  }
}

/**
 * Khởi tạo hoặc lấy một Prisma Client đã được cache dựa trên Connection String.
 * Sử dụng Promise caching để chống Race Condition khi Cold Start.
 */
async function getClientForConnectionStringAsync(connectionString: string): Promise<PrismaClient> {
  // 1. Trả về Client đang sống nếu có
  const cached = globalForPrisma.prismaClients!.get(connectionString);
  if (cached) {
    // Gia hạn TTL
    clearTimeout(cached.timeoutId);
    cached.timeoutId = setTimeout(() => evictConnection(connectionString), CONNECTION_TTL_MS);
    return cached.client;
  }

  // 2. Nếu đang trong quá trình khởi tạo (Race condition), chờ Promise đó
  let initPromise = globalForPrisma.prismaClientPromises!.get(connectionString);
  if (initPromise) {
    return initPromise;
  }

  // 3. Khởi tạo mới
  initPromise = (async () => {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    
    const client = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

    const timeoutId = setTimeout(() => evictConnection(connectionString), CONNECTION_TTL_MS);
    globalForPrisma.prismaClients!.set(connectionString, { client, timeoutId });
    return client;
  })();

  globalForPrisma.prismaClientPromises!.set(connectionString, initPromise);
  return initPromise;
}

/**
 * Khởi tạo đồng bộ (Synchronous) cho backward compatibility (sử dụng ở các hàm không async)
 * Chú ý: Ở môi trường Serverless, tốt nhất nên dùng bản Async.
 */
function getClientForConnectionStringSync(connectionString: string): PrismaClient {
  const cached = globalForPrisma.prismaClients!.get(connectionString);
  if (cached) {
    clearTimeout(cached.timeoutId);
    cached.timeoutId = setTimeout(() => evictConnection(connectionString), CONNECTION_TTL_MS);
    return cached.client;
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  const timeoutId = setTimeout(() => evictConnection(connectionString), CONNECTION_TTL_MS);
  globalForPrisma.prismaClients!.set(connectionString, { client, timeoutId });
  globalForPrisma.prismaClientPromises!.set(connectionString, Promise.resolve(client));
  return client;
}

/**
 * Lấy Prisma Client mặc định (Shared Database).
 */
export function getSharedDb(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing DATABASE_URL environment variable");
  }
  return getClientForConnectionStringSync(connectionString);
}

/**
 * Khởi tạo Global DB cũ để giữ tính tương thích ngược cho codebase hiện tại.
 */
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = getSharedDb();
}
export const db = globalForPrisma.prisma;

const globalModels = [
  "User", "Session", "Account", "Verification", 
  "Organization", "PlatformModule", "PlatformPlan", "PlanModule",
  "CustomDashboard"
];

function withTenantExtension(client: PrismaClient, organizationId: string) {
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (globalModels.includes(model)) {
            return query(args);
          }

          const modelLower = model.charAt(0).toLowerCase() + model.slice(1);

          if (operation === 'findUnique' || operation === 'findUniqueOrThrow') {
            (args as any).where = { ...(args as any).where, organizationId };
            const newOp = operation === 'findUnique' ? 'findFirst' : 'findFirstOrThrow';
            return (client as any)[modelLower][newOp](args);
          }

          const readOperations = ['findFirst', 'findMany', 'count', 'groupBy', 'aggregate', 'findFirstOrThrow'];
          const writeOperations = ['update', 'updateMany', 'delete', 'deleteMany'];

          if (readOperations.includes(operation) || writeOperations.includes(operation)) {
            (args as any).where = { ...(args as any).where, organizationId };
          }
          
          if (operation === 'create' || operation === 'createMany') {
            if (Array.isArray((args as any).data)) {
              (args as any).data = (args as any).data.map((d: any) => ({ ...d, organizationId }));
            } else {
              (args as any).data = { ...(args as any).data, organizationId };
            }
          }

          if (operation === 'upsert') {
            (args as any).where = { ...(args as any).where, organizationId };
            (args as any).create = { ...(args as any).create, organizationId };
          }

          return query(args);
        }
      }
    }
  });
}

/**
 * Lấy Prisma Client mặc định (Shared Database - Không bị lọc bởi tenant).
 * Thường dùng cho các Job hệ thống, Webhook tổng, hoặc Sync/Migration.
 */
export function getSystemDb(): PrismaClient {
  return getSharedDb();
}

/**
 * Lấy Prisma Client (hoặc Transaction) dựa trên Context hiện tại của Tenant.
 * TỰ ĐỘNG áp dụng Data Isolation Extension để chặn rò rỉ dữ liệu chéo.
 */
export function getTenantDb(organizationId?: string, tx?: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">): PrismaClient {
  if (tx) return tx as PrismaClient;

  const context = getTenantContext();
  const activeOrgId = organizationId || context?.organizationId;
  
  const url = process.env.DATABASE_URL;
  
  if (!url) {
    throw new Error("Missing DATABASE_URL environment variable");
  }

  const baseClient = getClientForConnectionStringSync(url);

  if (!activeOrgId) {
    // Nếu không có orgId (ví dụ Webhook chung, Login), trả về base client an toàn
    return baseClient;
  }

  const cached = globalForPrisma.prismaClients!.get(url);
  if (cached) {
    if (!cached.tenantClients) {
      cached.tenantClients = new Map();
    }
    const tenantClient = cached.tenantClients.get(activeOrgId);
    if (tenantClient) return tenantClient as unknown as PrismaClient;

    const newTenantClient = withTenantExtension(baseClient, activeOrgId);
    cached.tenantClients.set(activeOrgId, newTenantClient);
    return newTenantClient as unknown as PrismaClient;
  }
  
  return withTenantExtension(baseClient, activeOrgId) as unknown as PrismaClient;
}
