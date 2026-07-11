import { NextResponse } from "next/server";
import { getTenantDb } from "@/lib/db";
import { LeadService } from "@/modules/leads/services/lead.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ secret: string }> }
) {
  try {
    const secretKey = (await params).secret;
    const webhook = await getTenantDb().leadWebhook.findUnique({
      where: { secretKey },
    });

    if (!webhook || !webhook.isActive) {
      return NextResponse.json({ error: "Webhook không hợp lệ hoặc đã bị vô hiệu hóa" }, { status: 401 });
    }

    const payload = await request.json();

    // Lô-gic nhận diện và bóc tách dữ liệu linh hoạt (Fuzzy extraction)
    // Các Webhook từ Facebook, Zapier, Tiktok thường gửi cấu trúc JSON khác nhau
    // Ta cố gắng tìm các trường phổ biến
    
    // Tìm fullName
    let fullName = payload.fullName || payload.full_name || payload.name || payload.ho_ten || payload["Họ và tên"] || "Unknown Lead";
    
    // Tìm email
    let email = payload.email || payload.mail || payload.email_address || payload["Email"];
    
    // Tìm phone
    let phone = payload.phone || payload.phone_number || payload.sdt || payload.so_dien_thoai || payload["Số điện thoại"];
    
    // Tìm note
    let note = payload.note || payload.ghi_chu || payload.message || payload.comments;

    // Gộp tất cả các field còn lại vào note
    let extraData = "";
    for (const [key, value] of Object.entries(payload)) {
      if (!['fullName', 'full_name', 'name', 'ho_ten', 'email', 'mail', 'phone', 'phone_number', 'sdt', 'note', 'message'].includes(key.toLowerCase())) {
        extraData += `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}\n`;
      }
    }

    if (extraData) {
      note = (note ? note + "\n\n" : "") + "--- Raw Payload Data ---\n" + extraData.trim();
    }

    // Nếu không có tên nhưng có email/phone thì lấy tạm làm tên
    if (fullName === "Unknown Lead") {
      if (email) fullName = email.split('@')[0];
      else if (phone) fullName = phone;
    }

    // Nếu không có gì hết thì không thể tạo Lead
    if (!email && !phone && fullName === "Unknown Lead") {
      return NextResponse.json({ error: "Payload không chứa thông tin định danh (email/phone/name)" }, { status: 400 });
    }

    const lead = await LeadService.createLead({
      organizationId: webhook.organizationId,
      fullName,
      email,
      phone,
      utmSource: webhook.sourceProvider || "Webhook",
      note: note,
      webhookId: webhook.id,
    });

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra khi xử lý Webhook" },
      { status: 500 }
    );
  }
}
