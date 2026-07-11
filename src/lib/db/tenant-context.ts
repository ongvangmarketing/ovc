import { AsyncLocalStorage } from "node:async_hooks";

export interface TenantContextData {
  organizationId: string;
  // Sau này có thể thêm:
  // dbUrl?: string; // Nếu cần định tuyến sang DB khác
}

export const tenantContext = new AsyncLocalStorage<TenantContextData>();

/**
 * Lấy Context hiện tại của Tenant.
 * Trả về null nếu không nằm trong ngữ cảnh của một Tenant cụ thể.
 */
export function getTenantContext(): TenantContextData | null {
  return tenantContext.getStore() ?? null;
}

/**
 * Thực thi một hàm bất đồng bộ trong ngữ cảnh của một Tenant cụ thể.
 * Tất cả các lệnh gọi đến getTenantContext() bên trong hàm này sẽ trả về dữ liệu context được cung cấp.
 */
export function runWithTenantContext<R>(
  context: TenantContextData,
  callback: () => Promise<R>
): Promise<R> {
  return tenantContext.run(context, callback);
}
