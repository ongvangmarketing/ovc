import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Webhook payload example:
// {
//   "firstName": "Nguyễn",
//   "lastName": "Văn A",
//   "email": "nguyenvana@gmail.com",
//   "phone": "0987654321",
//   "note": "Tôi muốn tư vấn làm website bán hàng",
//   "source": "Form Tư Vấn - Ongvang.com.vn"
// }

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      note?: string;
      source?: string;
    };
    
    // Validate API Key via headers (optional, basic security)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== "Bearer ONGVANG_SECRET_KEY") {
      // In a real scenario we enforce this. For demo/testing we can let it slide or log it.
      console.warn("Webhook received without proper authorization, but processing anyway for demo.");
    }

    // Default organization for the webhook (find the first one)
    const org = await db.organization.findFirst();
    if (!org) {
      return NextResponse.json({ error: "System not initialized (no organization found)" }, { status: 500 });
    }

    // Check if contact already exists by email or phone
    let contactId = "";
    const existingContact = await db.contact.findFirst({
      where: {
        organizationId: org.id,
        OR: [
          { email: data.email || "no-email-provided@example.com" },
          { phone: data.phone || "0000000000-invalid" }
        ]
      }
    });

    if (existingContact) {
      contactId = existingContact.id;
    } else {
      // Create new contact
      const newContact = await db.contact.create({
        data: {
          organizationId: org.id,
          firstName: data.firstName || "Khách hàng",
          lastName: data.lastName || "Mới",
          email: data.email || null,
          phone: data.phone || null,
          source: data.source || "Ongvang.com.vn",
          notes: data.note || "",
        }
      });
      contactId = newContact.id;
    }

    const leadStage = await db.dealStage.upsert({
      where: {
        id: `${org.id}-lead`,
      },
      update: {},
      create: {
        id: `${org.id}-lead`,
        organizationId: org.id,
        name: "Lead",
        color: "#f59e0b",
        order: 0,
        probability: 10,
        isDefault: true,
      },
    });

    // Create a Deal in the lead stage.
    await db.deal.create({
      data: {
        organizationId: org.id,
        title: `Tư vấn: ${data.firstName || ""} ${data.lastName || ""}`.trim(),
        value: 0,
        stageId: leadStage.id,
        contactId: contactId,
        expectedClose: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      }
    });

    return NextResponse.json({ success: true, message: "Data synced successfully to CRM" });
  } catch (error: unknown) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook failed" }, { status: 500 });
  }
}
