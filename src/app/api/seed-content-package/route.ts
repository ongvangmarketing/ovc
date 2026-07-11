import { getTenantDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Find organization OVMAIN (try both id and slug)
    let org = await getTenantDb().organization.findUnique({ where: { slug: "ongvangcomvn" } });
    if (!org) {
      org = await getTenantDb().organization.findUnique({ where: { slug: "OVMAIN" } });
    }
    if (!org) {
      // maybe it's by id
      org = await getTenantDb().organization.findFirst({
        where: {
          OR: [
            { id: "OVMAIN" },
            { slug: { contains: "ongvangcomvn", mode: "insensitive" } }
          ]
        }
      });
    }

    if (!org) {
      return NextResponse.json({ error: "Không tìm thấy công ty có mã OVMAIN" }, { status: 404 });
    }

    const orgId = org.id;

    // Create Service
    const service = await getTenantDb().service.upsert({
      where: {
        organizationId_slug: {
          organizationId: orgId,
          slug: "content-package",
        },
      },
      update: {},
      create: {
        organizationId: orgId,
        name: "Content Package",
        slug: "content-package",
        description: "Gói dịch vụ Content Marketing hàng tháng",
      },
    });

    // Create Service Options
    const optionsData = [
      {
        name: "01 BASIC CONTENT",
        price: 5000000,
        featuresJson: [
          "08 content/tháng, thiết kế hoàn chỉnh.",
          "04 special posts (bài quảng cáo, minigame, event...)",
          "Đã bao gồm kế hoạch content."
        ]
      },
      {
        name: "02 PREMIUM CONTENT",
        price: 7000000,
        featuresJson: [
          "10 content/tháng, thiết kế hoàn chỉnh.",
          "04 special posts (bài quảng cáo, minigame, event...)",
          "01 buổi chụp ảnh",
          "Kế hoạch content & chạy ads miễn phí."
        ]
      },
      {
        name: "03 FULL CONTENT",
        price: 9000000,
        featuresJson: [
          "12 content/tháng, thiết kế hoàn chỉnh.",
          "04 special posts (bài quảng cáo, minigame, event...)",
          "01 buổi chụp ảnh và quay phim",
          "Kế hoạch content & chạy ads miễn phí.",
          "Báo cáo hiệu quả & tăng trưởng hàng tháng."
        ]
      }
    ];

    for (const [i, opt] of optionsData.entries()) {
      
      // Delete existing if any to avoid duplicates in this seed
      await getTenantDb().serviceOption.deleteMany({
        where: {
          organizationId: orgId,
          serviceId: service.id,
          name: opt.name,
        }
      });

      await getTenantDb().serviceOption.create({
        data: {
          organizationId: orgId,
          serviceId: service.id,
          name: opt.name,
          price: opt.price,
          currency: "VND",
          unit: "tháng",
          durationText: "1 tháng",
          featuresJson: opt.featuresJson,
          sortOrder: i + 1,
        }
      });
    }

    return NextResponse.json({ message: "Seed Content Package thành công!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
