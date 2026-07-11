export class WorkflowRepository {
  static async list(organizationId: string, search?: string, status?: string, page?: number, limit?: number): Promise<any[]> {
    return [];
  }
  static async find(...args: any[]): Promise<any> {
    return null;
  }
  static async create(...args: any[]): Promise<any> {
    return null;
  }
  static async createVersion(...args: any[]): Promise<any> {
    return null;
  }
  static async updateDraft(...args: any[]): Promise<any> {
    return null;
  }
  static async transaction(...args: any[]): Promise<any> {
    return args[0](null);
  }
}
