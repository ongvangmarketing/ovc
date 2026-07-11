import { NextResponse } from "next/server";
import { getTenantDb } from "@/lib/db";
import { LeadService } from "@/modules/leads/services/lead.service";

// CORS Headers for allowing cross-origin form submissions
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formId, fullName, email, phone, note, utmSource, ...customFields } = body;

    if (!formId) {
      return NextResponse.json({ error: "Thiếu formId" }, { status: 400, headers: corsHeaders });
    }
    if (!fullName) {
      return NextResponse.json({ error: "Họ và tên là bắt buộc" }, { status: 400, headers: corsHeaders });
    }

    const form = await getTenantDb().leadForm.findUnique({
      where: { id: formId },
    });

    if (!form || form.status !== "ACTIVE") {
      return NextResponse.json({ error: "Form không tồn tại hoặc đã bị khóa" }, { status: 404, headers: corsHeaders });
    }

    // Combine custom fields into note if they exist
    let finalNote = note || "";
    if (Object.keys(customFields).length > 0) {
      finalNote += "\n\n--- Thông tin bổ sung ---\n" + 
        Object.entries(customFields).map(([k, v]) => `${k}: ${v}`).join("\n");
    }

    const lead = await LeadService.createLead({
      organizationId: form.organizationId,
      fullName,
      email,
      phone,
      utmSource: utmSource || "Website Form",
      note: finalNote.trim(),
      formId: form.id,
    });

    return NextResponse.json({ 
      success: true, 
      message: form.successMessage || "Đã gửi thông tin thành công!",
      redirectUrl: form.redirectUrl || null
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error("Form Submit Error:", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra khi gửi thông tin." },
      { status: 500, headers: corsHeaders }
    );
  }
}
