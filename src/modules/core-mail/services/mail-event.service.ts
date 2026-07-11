import { EventEmitter } from "events";

class MailEventService extends EventEmitter {
  constructor() {
    super();
    // Tăng max listeners nếu cần vì có nhiều module lắng nghe
    this.setMaxListeners(20);
  }

  // Pub/Sub cho các module khác lắng nghe
  public emitEmailReceived(data: { messageId: string; accountId: string; organizationId: string }) {
    this.emit("email.received", data);
  }

  public emitEmailSent(data: { messageId: string; accountId: string; organizationId: string }) {
    this.emit("email.sent", data);
  }
}

export const mailEventService = new MailEventService();
