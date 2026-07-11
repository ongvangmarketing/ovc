import { getTenantDb } from "@/lib/db";

export class LeadFormService {
  static async getLeadForms(orgId: string) {
    return getTenantDb().leadForm.findMany({
      where: { organizationId: orgId },
      include: { _count: { select: { leads: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async createLeadForm(orgId: string) {
    const newForm = await getTenantDb().leadForm.create({
      data: {
        organizationId: orgId,
        name: "Form Mới " + new Date().getTime(),
        title: "Đăng ký tư vấn",
      }
    });
    
    await getTenantDb().leadFormField.createMany({
      data: [
        { formId: newForm.id, name: "fullName", label: "Họ và tên", type: "text", required: true, order: 1 },
        { formId: newForm.id, name: "phone", label: "Số điện thoại", type: "tel", required: true, order: 2 },
        { formId: newForm.id, name: "email", label: "Email", type: "email", required: false, order: 3 },
      ]
    });

    return newForm.id;
  }

  static async getLeadFormBuilderData(orgId: string, formId: string) {
    return getTenantDb().leadForm.findUnique({
      where: { id: formId, organizationId: orgId },
      include: { fields: { orderBy: { order: 'asc' } } }
    });
  }

  static async updateLeadForm(formId: string, data: any) {
    return getTenantDb().leadForm.update({
      where: { id: formId },
      data
    });
  }
}
