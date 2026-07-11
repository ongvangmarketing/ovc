import type { EventDefinition } from "@/lib/automation/types/workflow.types";

const definitions: EventDefinition[] = [
  ["crm.lead.created", "crm", "Lead mới được tạo", ["leadId", "source", "ownerId"]],
  ["crm.lead.updated", "crm", "Lead được cập nhật", ["leadId", "changedFields"]],
  ["crm.deal.created", "crm", "Cơ hội mới được tạo", ["dealId", "value", "stageId"]],
  ["crm.deal.won", "crm", "Cơ hội được chốt thắng", ["dealId", "value", "customerId"]],
  ["crm.deal.lost", "crm", "Cơ hội bị mất", ["dealId", "reason"]],
  ["crm.customer.created", "crm", "Khách hàng mới được tạo", ["customerId", "contactId"]],
  ["finance.invoice.created", "finance", "Hóa đơn mới được tạo", ["invoiceId", "customerId", "amount", "dueDate"]],
  ["finance.invoice.paid", "finance", "Hóa đơn đã thanh toán", ["invoiceId", "paymentId", "amount", "paidAt"]],
  ["finance.payment.created", "finance", "Thanh toán mới được tạo", ["paymentId", "invoiceId", "amount"]],
  ["finance.payment.failed", "finance", "Thanh toán thất bại", ["paymentId", "reasonCode"]],
  ["training.student.enrolled", "training", "Học viên ghi danh", ["studentId", "courseId", "enrollmentId"]],
  ["training.student.completed", "training", "Học viên hoàn thành khóa học", ["studentId", "courseId", "completedAt"]],
  ["marketing.post.published", "marketing", "Bài viết đã xuất bản", ["postId", "channel", "publishedAt"]],
  ["marketing.lead.created", "marketing", "Marketing lead mới", ["leadId", "campaignId", "source"]],
  ["travel.booking.created", "travel", "Booking mới được tạo", ["bookingId", "customerId", "total"]],
  ["travel.booking.confirmed", "travel", "Booking đã xác nhận", ["bookingId", "confirmedAt"]],
  ["travel.booking.cancelled", "travel", "Booking đã hủy", ["bookingId", "reason"]],
  ["hospitality.reservation.created", "hospitality", "Đặt phòng mới", ["reservationId", "guestId"]],
  ["hospitality.reservation.confirmed", "hospitality", "Đặt phòng đã xác nhận", ["reservationId", "confirmedAt"]],
  ["hospitality.reservation.cancelled", "hospitality", "Đặt phòng đã hủy", ["reservationId", "reason"]],
  ["system.user.created", "system", "Người dùng mới được tạo", ["userId"]],
  ["system.organization.created", "system", "Tổ chức mới được tạo", ["organizationId", "ownerId"]],
].map(([name, module, description, payloadFields]) => ({
  name: name as string,
  module: module as string,
  description: description as string,
  payloadFields: payloadFields as string[],
  version: 1,
  lifecycle: "ACTIVE" as const,
}));

export class EventCatalogRegistry {
  static list() {
    return definitions;
  }

  static get(name: string, version = 1) {
    return definitions.find((definition) => definition.name === name && definition.version === version);
  }

  static assertRegistered(name: string, version = 1) {
    const definition = this.get(name, version);
    if (!definition) throw new Error(`Event chưa được đăng ký: ${name}@${version}`);
    return definition;
  }
}
