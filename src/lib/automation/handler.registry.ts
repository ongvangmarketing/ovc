import type { ActionResult, ExecutionContext, HandlerDefinition, JsonObject } from "@/lib/automation/types/workflow.types";

export type ActionHandler = {
  definition: HandlerDefinition;
  execute(context: ExecutionContext, config: JsonObject): Promise<ActionResult>;
};

const definitions: HandlerDefinition[] = [
  { key: "event.received", version: 1, displayName: "Sự kiện", description: "Bắt đầu khi nhận event", nodeType: "TRIGGER" },
  { key: "condition.compare", version: 1, displayName: "Điều kiện", description: "So sánh dữ liệu event", nodeType: "CONDITION" },
  { key: "record.create", version: 1, displayName: "Tạo bản ghi", description: "Tạo bản ghi qua Public Service của module", nodeType: "ACTION" },
  { key: "record.update", version: 1, displayName: "Cập nhật bản ghi", description: "Cập nhật bản ghi qua Public Service của module", nodeType: "ACTION" },
  { key: "record.delete", version: 1, displayName: "Xóa bản ghi", description: "Xóa bản ghi qua Public Service của module", nodeType: "ACTION" },
  { key: "user.assign", version: 1, displayName: "Gán người phụ trách", description: "Gán người dùng cho bản ghi", nodeType: "ACTION" },
  { key: "task.create", version: 1, displayName: "Tạo công việc", description: "Tạo nhiệm vụ mới", nodeType: "ACTION" },
  { key: "email.send", version: 1, displayName: "Gửi Email", description: "Gửi email theo mẫu", nodeType: "ACTION" },
  { key: "zalo.send", version: 1, displayName: "Gửi Zalo", description: "Gửi tin nhắn Zalo", nodeType: "ACTION" },
  { key: "notification.send", version: 1, displayName: "Gửi thông báo", description: "Gửi thông báo nội bộ", nodeType: "ACTION" },
  { key: "http.request", version: 1, displayName: "HTTP Request", description: "Gọi endpoint bên ngoài", nodeType: "ACTION" },
  { key: "webhook.send", version: 1, displayName: "Gửi Webhook", description: "Gửi payload tới webhook", nodeType: "ACTION" },
  { key: "ai.call", version: 1, displayName: "Gọi AI", description: "Gửi yêu cầu tới AI service", nodeType: "ACTION" },
  { key: "document.generate", version: 1, displayName: "Tạo tài liệu", description: "Tạo tài liệu từ mẫu", nodeType: "ACTION" },
  { key: "invoice.generate", version: 1, displayName: "Tạo hóa đơn", description: "Tạo hóa đơn qua Finance Public Service", nodeType: "ACTION" },
  { key: "contract.generate", version: 1, displayName: "Tạo hợp đồng", description: "Tạo hợp đồng qua Finance Public Service", nodeType: "ACTION" },
  { key: "sms.send", version: 1, displayName: "Gửi SMS", description: "Gửi tin nhắn văn bản SMS", nodeType: "ACTION" },
  { key: "slack.send", version: 1, displayName: "Gửi Slack", description: "Gửi tin nhắn vào kênh Slack", nodeType: "ACTION" },
  { key: "data.transform", version: 1, displayName: "Xử lý dữ liệu", description: "Biến đổi định dạng dữ liệu", nodeType: "ACTION" },
  { key: "math.calculate", version: 1, displayName: "Tính toán", description: "Thực hiện phép tính toán học", nodeType: "ACTION" },
  { key: "file.upload", version: 1, displayName: "Tải lên File", description: "Tải file lên hệ thống", nodeType: "ACTION" },
  { key: "payment.create", version: 1, displayName: "Link thanh toán", description: "Tạo yêu cầu thanh toán", nodeType: "ACTION" },
  { key: "approval.request", version: 1, displayName: "Yêu cầu duyệt", description: "Tạo luồng phê duyệt", nodeType: "ACTION" },
  { key: "delay.wait", version: 1, displayName: "Chờ", description: "Tạm dừng workflow", nodeType: "DELAY" },
  { key: "workflow.branch", version: 1, displayName: "Rẽ nhánh", description: "Tạo nhiều nhánh xử lý", nodeType: "BRANCH" },
  { key: "workflow.end", version: 1, displayName: "Kết thúc", description: "Kết thúc workflow", nodeType: "END" },
];

const actions = new Map<string, ActionHandler>();

export class HandlerRegistry {
  static list() {
    return definitions;
  }

  static has(key: string, version: number) {
    return definitions.some((item) => item.key === key && item.version === version);
  }

  static registerAction(handler: ActionHandler) {
    const id = `${handler.definition.key}@${handler.definition.version}`;
    if (actions.has(id)) throw new Error(`Action handler đã tồn tại: ${id}`);
    actions.set(id, handler);
  }

  static getAction(key: string, version: number) {
    return actions.get(`${key}@${version}`);
  }
}
