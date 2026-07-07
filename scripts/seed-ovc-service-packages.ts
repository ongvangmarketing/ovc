import "dotenv/config";

import { db } from "../src/lib/db";

type ServiceSeed = {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  options: Array<{
    name: string;
    description: string;
    price: number;
    unit: string;
    durationText: string;
    featuresJson: string[];
    internalNote: string;
    sortOrder: number;
  }>;
};

const services: ServiceSeed[] = [
  {
    name: "Brand Package",
    slug: "brand-package",
    description: "Bộ gói xây dựng nhận diện thương hiệu, phù hợp từ logo khởi đầu đến hệ thống nhận diện dùng được ngay trong bán hàng.",
    sortOrder: 10,
    options: [
      {
        name: "Basic Brand - Logo khởi đầu",
        description: "Gói gọn cho doanh nghiệp mới cần logo chỉn chu, có file bàn giao chuẩn để dùng ngay trên kênh bán hàng.",
        price: 4000000,
        unit: "gói",
        durationText: "5-7 ngày làm việc",
        featuresJson: [
          "2 phương án thiết kế logo để khách chọn hướng nhận diện.",
          "2 vòng chỉnh sửa miễn phí theo góp ý.",
          "Bàn giao PNG, JPG độ phân giải cao và file vector.",
          "Phù hợp hộ kinh doanh, dự án mới hoặc thương hiệu cần ra mắt nhanh."
        ],
        internalNote: "Gợi ý chốt: nhấn vào tốc độ triển khai và đủ file để khách dùng ngay cho avatar, bảng hiệu, ấn phẩm cơ bản.",
        sortOrder: 1
      },
      {
        name: "Premium Brand - Nhận diện bán hàng",
        description: "Gói dành cho doanh nghiệp muốn logo độc quyền kèm bộ ứng dụng cơ bản để bán hàng chuyên nghiệp hơn.",
        price: 7000000,
        unit: "gói",
        durationText: "7-10 ngày làm việc",
        featuresJson: [
          "3 phương án logo độc quyền theo định vị thương hiệu.",
          "Không giới hạn chỉnh sửa trong phạm vi concept đã chọn.",
          "Bộ ứng dụng cá nhân: name card và chữ ký email.",
          "Sổ tay hướng dẫn thương hiệu cơ bản.",
          "Bàn giao PNG, JPG độ phân giải cao và file vector."
        ],
        internalNote: "Gợi ý chốt: phù hợp khách cần thương hiệu đáng tin khi gặp đối tác, gửi báo giá hoặc chạy truyền thông.",
        sortOrder: 2
      },
      {
        name: "Full Brand - Bộ nhận diện toàn diện",
        description: "Gói hoàn chỉnh cho doanh nghiệp cần hệ thống nhận diện đồng bộ trên văn phòng, bán hàng và truyền thông.",
        price: 10000000,
        unit: "gói",
        durationText: "10-14 ngày làm việc",
        featuresJson: [
          "5 phương án logo sáng tạo, khác biệt theo cá tính thương hiệu.",
          "Không giới hạn chỉnh sửa trong phạm vi triển khai.",
          "Bộ nhận diện: name card, letterhead, phong bì, chữ ký email, đồng phục, thẻ nhân viên.",
          "Bộ ứng dụng social post đa nền tảng.",
          "Phù hợp doanh nghiệp muốn chuẩn hóa hình ảnh trước khi mở rộng bán hàng."
        ],
        internalNote: "Gợi ý chốt: bán theo lợi ích đồng bộ hình ảnh, giảm chi phí làm lẻ từng hạng mục về sau.",
        sortOrder: 3
      }
    ]
  },
  {
    name: "Content Package",
    slug: "content-package",
    description: "Gói Content Marketing hàng tháng giúp fanpage có nội dung đều, đẹp và có kế hoạch rõ để hỗ trợ bán hàng.",
    sortOrder: 20,
    options: [
      {
        name: "Basic Content - Duy trì fanpage",
        description: "Gói duy trì nền tảng cho thương hiệu cần nội dung đều đặn, có thiết kế hoàn chỉnh và lịch đăng rõ ràng.",
        price: 5000000,
        unit: "tháng",
        durationText: "Tối thiểu 1 tháng",
        featuresJson: [
          "8 nội dung/tháng, bao gồm thiết kế hoàn chỉnh.",
          "4 special posts cho quảng cáo, minigame hoặc sự kiện.",
          "Đã bao gồm kế hoạch content theo tháng.",
          "Phù hợp doanh nghiệp mới bắt đầu chăm sóc fanpage bài bản."
        ],
        internalNote: "Gợi ý chốt: dùng cho khách muốn fanpage sống đều, không bị bỏ trống nội dung.",
        sortOrder: 1
      },
      {
        name: "Premium Content - Tăng trưởng đều",
        description: "Gói cân bằng giữa nội dung, hình ảnh thật và tư vấn quảng cáo để thương hiệu có chất liệu bán hàng tốt hơn.",
        price: 7000000,
        unit: "tháng",
        durationText: "Tối thiểu 1 tháng",
        featuresJson: [
          "10 nội dung/tháng, bao gồm thiết kế hoàn chỉnh.",
          "4 special posts cho quảng cáo, minigame hoặc sự kiện.",
          "1 buổi chụp ảnh sản phẩm, dịch vụ hoặc không gian.",
          "Kế hoạch content và tư vấn/chạy ads miễn phí theo phạm vi gói.",
          "Phù hợp doanh nghiệp đang marketing định kỳ."
        ],
        internalNote: "Gợi ý chốt: nhấn mạnh có ảnh thật giúp nội dung tin cậy và dễ chạy quảng cáo hơn.",
        sortOrder: 2
      },
      {
        name: "Full Content - Tăng trưởng có báo cáo",
        description: "Gói chăm sóc nội dung mạnh hơn, có ảnh, video và báo cáo để theo dõi tăng trưởng hàng tháng.",
        price: 9000000,
        unit: "tháng",
        durationText: "Tối thiểu 1 tháng",
        featuresJson: [
          "12 nội dung/tháng, bao gồm thiết kế hoàn chỉnh.",
          "4 special posts cho quảng cáo, minigame hoặc sự kiện.",
          "1 buổi chụp ảnh và quay phim.",
          "Kế hoạch content và tư vấn/chạy ads miễn phí theo phạm vi gói.",
          "Báo cáo hiệu quả và tăng trưởng hàng tháng."
        ],
        internalNote: "Gợi ý chốt: phù hợp khách muốn có dữ liệu theo dõi, không chỉ đăng bài cho có.",
        sortOrder: 3
      }
    ]
  },
  {
    name: "Design Package",
    slug: "design-package",
    description: "Gói thiết kế ấn phẩm truyền thông theo kỳ, giúp doanh nghiệp có hình ảnh đồng bộ cho banner, poster và social post.",
    sortOrder: 30,
    options: [
      {
        name: "Basic Design - Thiết kế ngắn hạn",
        description: "Gói tiết kiệm cho chiến dịch ngắn hoặc doanh nghiệp nhỏ cần bộ ấn phẩm đều và đúng nhận diện.",
        price: 6000000,
        unit: "gói",
        durationText: "3 tháng",
        featuresJson: [
          "15 thiết kế cho banner, poster, social post và ấn phẩm tương đương.",
          "Chỉnh sửa miễn phí 2 lần cho mỗi thiết kế.",
          "Phù hợp doanh nghiệp nhỏ hoặc dự án ngắn hạn.",
          "Giúp khách có hình ảnh truyền thông đồng bộ mà không cần tuyển designer nội bộ."
        ],
        internalNote: "Gợi ý chốt: phù hợp khách đang cần ra mắt chiến dịch nhanh, ngân sách gọn.",
        sortOrder: 1
      },
      {
        name: "Premium Design - Thiết kế định kỳ",
        description: "Gói dành cho doanh nghiệp có hoạt động marketing liên tục, cần nhiều ấn phẩm hơn và chỉnh sửa linh hoạt.",
        price: 8000000,
        unit: "gói",
        durationText: "6 tháng",
        featuresJson: [
          "25 thiết kế cho banner, poster, social post và ấn phẩm tương đương.",
          "Chỉnh sửa miễn phí 3 lần cho mỗi thiết kế.",
          "Phù hợp doanh nghiệp có lịch marketing định kỳ.",
          "Giúp duy trì hình ảnh nhất quán trên các kênh truyền thông."
        ],
        internalNote: "Gợi ý chốt: nhấn vào hiệu quả duy trì đều 6 tháng và giảm phát sinh thiết kế lẻ.",
        sortOrder: 2
      },
      {
        name: "Full Design - Thiết kế ưu tiên",
        description: "Gói thiết kế dài hạn cho doanh nghiệp muốn hình ảnh chuyên nghiệp, nhiều ấn phẩm và được ưu tiên xử lý.",
        price: 10000000,
        unit: "gói",
        durationText: "12 tháng",
        featuresJson: [
          "35 thiết kế cho banner, poster, social post và ấn phẩm tương đương.",
          "Chỉnh sửa miễn phí 3 lần cho mỗi thiết kế.",
          "Ưu tiên thời gian xử lý trong ngày làm việc.",
          "Phù hợp doanh nghiệp xây dựng hình ảnh chuyên nghiệp dài hạn."
        ],
        internalNote: "Gợi ý chốt: dùng cho khách đã có kế hoạch truyền thông cả năm và cần đội thiết kế đồng hành.",
        sortOrder: 3
      }
    ]
  },
  {
    name: "Media Package",
    slug: "media-package",
    description: "Gói sản xuất hình ảnh và video giúp doanh nghiệp có tư liệu thật để chạy quảng cáo, đăng bài và nâng độ tin cậy thương hiệu.",
    sortOrder: 40,
    options: [
      {
        name: "Basic Media - Bộ ảnh/video nhanh",
        description: "Gói quay chụp gọn cho F&B, cửa hàng nhỏ hoặc dịch vụ cần tư liệu nhanh để đăng bài và chạy quảng cáo.",
        price: 3000000,
        unit: "gói",
        durationText: "2 giờ quay/chụp",
        featuresJson: [
          "Quay/chụp 2 giờ, phù hợp F&B và cửa hàng nhỏ.",
          "20-30 ảnh chỉnh màu cơ bản.",
          "1 video highlight 60-90 giây.",
          "Team thực hiện: 1 photographer."
        ],
        internalNote: "Gợi ý chốt: phù hợp khách cần tư liệu thật nhanh, chi phí thấp, có cả ảnh và video.",
        sortOrder: 1
      },
      {
        name: "Premium Media - Nội dung thương hiệu",
        description: "Gói phù hợp spa, homestay và ngành dịch vụ cần ảnh/video có tone thương hiệu để dùng nhiều kênh.",
        price: 6000000,
        unit: "gói",
        durationText: "2-3 giờ quay/chụp",
        featuresJson: [
          "Quay/chụp 2-3 giờ, phù hợp spa, homestay và dịch vụ.",
          "30-40 ảnh chỉnh tone theo brand.",
          "2 video cơ bản: 45-60 giây và 60-90 giây.",
          "Team thực hiện: photographer và videographer."
        ],
        internalNote: "Gợi ý chốt: nhấn vào ảnh/video đồng bộ brand, đủ dùng cho fanpage, reels và quảng cáo.",
        sortOrder: 2
      },
      {
        name: "Full Media - Sản xuất cao cấp",
        description: "Gói cao cấp cho resort, khách sạn hoặc thương hiệu cần bộ tư liệu chuyên nghiệp, nhiều định dạng và có flycam.",
        price: 9000000,
        unit: "gói",
        durationText: "3-4 giờ quay/chụp",
        featuresJson: [
          "Fullday 3-4 giờ theo tiêu chuẩn resort, khách sạn.",
          "40-60 ảnh chỉnh màu cao cấp.",
          "3 video chuyên nghiệp: 45-60 giây, 60-90 giây và 90-180 giây.",
          "Team thực hiện: photographer, videographer và flycam."
        ],
        internalNote: "Gợi ý chốt: phù hợp khách cần bộ tư liệu đủ mạnh cho landing page, quảng cáo và truyền thông dài hạn.",
        sortOrder: 3
      }
    ]
  },
  {
    name: "Web Package",
    slug: "web-package",
    description: "Gói thiết kế website giới thiệu doanh nghiệp, giúp khách có điểm chạm chuyên nghiệp để nhận lead và tăng uy tín.",
    sortOrder: 50,
    options: [
      {
        name: "Basic Web - Website giới thiệu nhanh",
        description: "Gói website gọn để doanh nghiệp có trang giới thiệu chuyên nghiệp, đủ form liên hệ và thông tin bán hàng cơ bản.",
        price: 4500000,
        unit: "gói",
        durationText: "5-7 ngày làm việc",
        featuresJson: [
          "Thiết kế website giới thiệu 3-5 trang.",
          "Giao diện tối giản, thân thiện người dùng và tối ưu hiển thị.",
          "Tích hợp form liên hệ, bản đồ và các nút hành động.",
          "Phù hợp doanh nghiệp cần online nhanh với ngân sách gọn."
        ],
        internalNote: "Gợi ý chốt: bán theo nhu cầu có website nhanh để khách xem thông tin và liên hệ.",
        sortOrder: 1
      },
      {
        name: "Premium Web - Website doanh nghiệp",
        description: "Gói website chuyên nghiệp hơn, có tùy chỉnh nhận diện và tối ưu cơ bản để hỗ trợ bán hàng lâu dài.",
        price: 6000000,
        unit: "gói",
        durationText: "7-10 ngày làm việc",
        featuresJson: [
          "Website 5-7 trang với bố cục chuyên nghiệp.",
          "Tùy chỉnh theo nhận diện thương hiệu.",
          "Tích hợp form liên hệ, bản đồ, nút hành động và thư viện ảnh/video.",
          "Tối ưu tốc độ tải trang và SEO cơ bản."
        ],
        internalNote: "Gợi ý chốt: phù hợp khách muốn website dùng được cho quảng cáo và giới thiệu dịch vụ rõ hơn.",
        sortOrder: 2
      },
      {
        name: "Full Web - Website cao cấp",
        description: "Gói website cao cấp cho thương hiệu cần giao diện riêng, nhiều trang nội dung và nền tảng tốt để mở rộng marketing.",
        price: 7500000,
        unit: "gói",
        durationText: "10-14 ngày làm việc",
        featuresJson: [
          "Website 7-12 trang với giao diện cao cấp.",
          "Concept đồng bộ thương hiệu, sáng tạo riêng.",
          "Tích hợp form liên hệ, bản đồ, nút hành động và thư viện ảnh/video.",
          "Tối ưu toàn diện: SEO cơ bản, tốc độ tải trang và tính bảo mật."
        ],
        internalNote: "Gợi ý chốt: phù hợp khách cần website làm tài sản thương hiệu, không chỉ là trang giới thiệu đơn giản.",
        sortOrder: 3
      }
    ]
  },
  {
    name: "Hoạch định Truyền thông Marketing",
    slug: "marketing-planning-package",
    description: "Gói tư vấn và triển khai truyền thông giúp doanh nghiệp có chiến lược, thông điệp, kênh bán hàng và hệ thống đo lường rõ ràng.",
    sortOrder: 60,
    options: [
      {
        name: "Gói Tư vấn Hoạch định",
        description: "Dành cho doanh nghiệp cần nhìn rõ hướng đi 3-6 tháng trước khi triển khai truyền thông hoặc chạy quảng cáo.",
        price: 6000000,
        unit: "tháng",
        durationText: "Tối thiểu 3 tháng",
        featuresJson: [
          "Phác thảo tầm nhìn và mục tiêu truyền thông theo giai đoạn 3-6 tháng.",
          "Xây dựng chân dung khách hàng, nhu cầu và insight cốt lõi.",
          "Đánh giá doanh nghiệp theo SWOT và lợi thế cạnh tranh.",
          "Xác lập giải pháp thương hiệu: key visual và brand voice.",
          "Lập kế hoạch truyền thông chi tiết kèm chỉ số đo lường."
        ],
        internalNote: "Gợi ý chốt: phù hợp khách đang rối hướng marketing, cần bản đồ rõ trước khi chi tiền triển khai.",
        sortOrder: 1
      },
      {
        name: "Gói Thực thi Triển khai",
        description: "Dành cho doanh nghiệp muốn có đội ngũ đồng hành triển khai chiến lược, sản xuất nội dung và tối ưu hiệu suất hàng tuần.",
        price: 12000000,
        unit: "tháng",
        durationText: "Tối thiểu 3 tháng",
        featuresJson: [
          "Tư vấn hoạch định chiến lược theo mục tiêu doanh số.",
          "Thiết lập hệ thống đa kênh và xây dựng phễu chuyển đổi.",
          "Phát triển thông điệp và key visual theo định vị thương hiệu.",
          "Sản xuất nội dung theo kế hoạch: bài viết, hình ảnh và video.",
          "Theo dõi và tối ưu hiệu suất chiến dịch theo tuần.",
          "Báo cáo đo lường dựa trên hành trình khách hàng.",
          "Đề xuất cải tiến liên tục giúp doanh nghiệp tăng trưởng."
        ],
        internalNote: "Gợi ý chốt: bán theo kết quả vận hành liên tục, có chiến lược, nội dung, đo lường và tối ưu cùng lúc.",
        sortOrder: 2
      }
    ]
  }
];

async function findOrganization() {
  const organization = await db.organization.findFirst({
    where: {
      OR: [
        { slug: { equals: "ovmain", mode: "insensitive" } },
        { id: "OVMAIN" },
        { name: { contains: "Ong Vàng", mode: "insensitive" } }
      ]
    },
    orderBy: { createdAt: "asc" }
  });

  if (organization) return organization;

  const fallback = await db.organization.findFirst({ orderBy: { createdAt: "asc" } });
  if (!fallback) throw new Error("Không tìm thấy tổ chức để seed dịch vụ.");
  return fallback;
}

async function upsertOption(organizationId: string, serviceId: string, option: ServiceSeed["options"][number]) {
  const existingOptions = await db.serviceOption.findMany({
    where: { organizationId, serviceId },
    orderBy: { sortOrder: "asc" }
  });
  const normalizedName = option.name.toLowerCase();
  const existing =
    existingOptions.find((item) => item.name.toLowerCase() === normalizedName) ??
    existingOptions.find((item) => {
      const current = item.name.toLowerCase();
      return current.includes(normalizedName.split(" - ")[0].toLowerCase()) || normalizedName.includes(current);
    });

  const data = {
    name: option.name,
    description: option.description,
    price: option.price,
    currency: "VND",
    unit: option.unit,
    durationText: option.durationText,
    featuresJson: option.featuresJson,
    internalNote: option.internalNote,
    isQuoteable: true,
    status: "ACTIVE" as const,
    sortOrder: option.sortOrder
  };

  if (existing) {
    await db.serviceOption.update({ where: { id: existing.id }, data });
    return;
  }

  await db.serviceOption.create({
    data: {
      ...data,
      organizationId,
      serviceId
    }
  });
}

async function main() {
  const organization = await findOrganization();

  if (!(db as any).service || !(db as any).serviceOption) {
    await seedWithRawSql(organization.id);
    return;
  }

  for (const serviceSeed of services) {
    const service = await db.service.upsert({
      where: {
        organizationId_slug: {
          organizationId: organization.id,
          slug: serviceSeed.slug
        }
      },
      update: {
        name: serviceSeed.name,
        description: serviceSeed.description,
        status: "ACTIVE",
        sortOrder: serviceSeed.sortOrder
      },
      create: {
        organizationId: organization.id,
        name: serviceSeed.name,
        slug: serviceSeed.slug,
        description: serviceSeed.description,
        status: "ACTIVE",
        sortOrder: serviceSeed.sortOrder
      }
    });

    for (const option of serviceSeed.options) {
      await upsertOption(organization.id, service.id, option);
    }
  }

  const seeded = await db.service.findMany({
    where: {
      organizationId: organization.id,
      slug: { in: services.map((service) => service.slug) }
    },
    include: { options: true },
    orderBy: { sortOrder: "asc" }
  });

  console.log(`Seeded ${seeded.length} service groups for ${organization.name}.`);
  for (const service of seeded) {
    console.log(`- ${service.name}: ${service.options.length} options`);
  }
}

function seededServiceId(slug: string) {
  return `seed_${slug.replace(/[^a-z0-9]+/g, "_")}`;
}

function seededOptionId(serviceSlug: string, sortOrder: number) {
  return `${seededServiceId(serviceSlug)}_${sortOrder}`;
}

async function seedWithRawSql(organizationId: string) {
  await ensureServiceTablesRawSql();

  for (const serviceSeed of services) {
    const serviceId = seededServiceId(serviceSeed.slug);

    await db.$executeRawUnsafe(
      `
        insert into "services" ("id", "organizationId", "name", "slug", "description", "status", "sortOrder", "createdAt", "updatedAt")
        values ($1, $2, $3, $4, $5, 'ACTIVE', $6, now(), now())
        on conflict ("organizationId", "slug")
        do update set
          "name" = excluded."name",
          "description" = excluded."description",
          "status" = excluded."status",
          "sortOrder" = excluded."sortOrder",
          "updatedAt" = now()
      `,
      serviceId,
      organizationId,
      serviceSeed.name,
      serviceSeed.slug,
      serviceSeed.description,
      serviceSeed.sortOrder
    );

    const resolved = await db.$queryRawUnsafe<Array<{ id: string }>>(
      `select "id" from "services" where "organizationId" = $1 and "slug" = $2 limit 1`,
      organizationId,
      serviceSeed.slug
    );
    const resolvedServiceId = resolved[0]?.id || serviceId;

    for (const option of serviceSeed.options) {
      await db.$executeRawUnsafe(
        `
          insert into "service_options" (
            "id", "organizationId", "serviceId", "name", "description", "price", "currency", "unit",
            "durationText", "featuresJson", "internalNote", "isQuoteable", "status", "sortOrder", "createdAt", "updatedAt"
          )
          values ($1, $2, $3, $4, $5, $6::numeric, 'VND', $7, $8, $9::jsonb, $10, true, 'ACTIVE', $11, now(), now())
          on conflict ("id")
          do update set
            "organizationId" = excluded."organizationId",
            "serviceId" = excluded."serviceId",
            "name" = excluded."name",
            "description" = excluded."description",
            "price" = excluded."price",
            "currency" = excluded."currency",
            "unit" = excluded."unit",
            "durationText" = excluded."durationText",
            "featuresJson" = excluded."featuresJson",
            "internalNote" = excluded."internalNote",
            "isQuoteable" = excluded."isQuoteable",
            "status" = excluded."status",
            "sortOrder" = excluded."sortOrder",
            "updatedAt" = now()
        `,
        seededOptionId(serviceSeed.slug, option.sortOrder),
        organizationId,
        resolvedServiceId,
        option.name,
        option.description,
        option.price,
        option.unit,
        option.durationText,
        JSON.stringify(option.featuresJson),
        option.internalNote,
        option.sortOrder
      );
    }
  }

  const seeded = await db.$queryRawUnsafe<Array<{ name: string; options_count: bigint }>>(
    `
      select s."name", count(o."id") as options_count
      from "services" s
      left join "service_options" o on o."serviceId" = s."id"
      where s."organizationId" = $1 and s."slug" = any($2::text[])
      group by s."id", s."name", s."sortOrder"
      order by s."sortOrder" asc
    `,
    organizationId,
    services.map((service) => service.slug)
  );

  console.log(`Seeded ${seeded.length} service groups with raw SQL.`);
  for (const service of seeded) {
    console.log(`- ${service.name}: ${Number(service.options_count)} options`);
  }
}

async function ensureServiceTablesRawSql() {
  await db.$executeRawUnsafe(`
    do $$
    begin
      create type "ServiceStatus" as enum ('ACTIVE', 'INACTIVE', 'ARCHIVED');
    exception
      when duplicate_object then null;
    end $$;
  `);

  await db.$executeRawUnsafe(`
    create table if not exists "service_categories" (
      "id" text primary key,
      "organizationId" text not null references "organizations"("id") on delete cascade,
      "name" text not null,
      "description" text,
      "sortOrder" integer not null default 0,
      "status" "ServiceStatus" not null default 'ACTIVE',
      "createdAt" timestamp(3) not null default current_timestamp,
      "updatedAt" timestamp(3) not null default current_timestamp
    );
  `);

  await db.$executeRawUnsafe(`
    create table if not exists "services" (
      "id" text primary key,
      "organizationId" text not null references "organizations"("id") on delete cascade,
      "categoryId" text references "service_categories"("id") on delete set null,
      "name" text not null,
      "slug" text not null,
      "description" text,
      "status" "ServiceStatus" not null default 'ACTIVE',
      "sortOrder" integer not null default 0,
      "createdBy" text references "users"("id") on delete set null,
      "createdAt" timestamp(3) not null default current_timestamp,
      "updatedAt" timestamp(3) not null default current_timestamp
    );
  `);

  await db.$executeRawUnsafe(`
    create table if not exists "service_options" (
      "id" text primary key,
      "organizationId" text not null references "organizations"("id") on delete cascade,
      "serviceId" text not null references "services"("id") on delete cascade,
      "name" text not null,
      "description" text,
      "price" numeric(65, 30) not null default 0,
      "currency" text not null default 'VND',
      "unit" text,
      "durationText" text,
      "featuresJson" jsonb,
      "internalNote" text,
      "isQuoteable" boolean not null default true,
      "status" "ServiceStatus" not null default 'ACTIVE',
      "sortOrder" integer not null default 0,
      "createdAt" timestamp(3) not null default current_timestamp,
      "updatedAt" timestamp(3) not null default current_timestamp
    );
  `);

  await db.$executeRawUnsafe(`create unique index if not exists "services_organizationId_slug_key" on "services" ("organizationId", "slug");`);
  await db.$executeRawUnsafe(`create index if not exists "service_categories_organizationId_idx" on "service_categories" ("organizationId");`);
  await db.$executeRawUnsafe(`create index if not exists "services_organizationId_idx" on "services" ("organizationId");`);
  await db.$executeRawUnsafe(`create index if not exists "services_categoryId_idx" on "services" ("categoryId");`);
  await db.$executeRawUnsafe(`create index if not exists "service_options_organizationId_idx" on "service_options" ("organizationId");`);
  await db.$executeRawUnsafe(`create index if not exists "service_options_serviceId_idx" on "service_options" ("serviceId");`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
