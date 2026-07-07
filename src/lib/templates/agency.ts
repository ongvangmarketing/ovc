export const agencyTemplate = {
  pages: [
    {
      frames: [
        {
          component: {
            type: "wrapper",
            components: [
              {
                tagName: "section",
                attributes: { class: "py-24 bg-blue-600 text-white text-center px-4" },
                components: [
                  { tagName: "h1", attributes: { class: "text-5xl font-extrabold tracking-tight mb-6" }, components: ["Giải pháp Marketing Toàn Diện"] },
                  { tagName: "p", attributes: { class: "text-xl mb-10 max-w-2xl mx-auto opacity-90" }, components: ["Đồng hành cùng doanh nghiệp tối ưu chi phí, tăng trưởng doanh thu với các chiến dịch đa kênh hiệu quả."] },
                  { tagName: "button", attributes: { class: "bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg" }, components: ["Nhận Tư Vấn Miễn Phí"] }
                ]
              },
              {
                tagName: "section",
                attributes: { class: "py-20 bg-gray-50" },
                components: [
                  { tagName: "div", attributes: { class: "container mx-auto px-4 max-w-6xl" }, components: [
                    { tagName: "h2", attributes: { class: "text-3xl font-bold text-center mb-4 text-gray-900" }, components: ["Dịch Vụ Nổi Bật"] },
                    { tagName: "p", attributes: { class: "text-center text-gray-500 mb-12 max-w-2xl mx-auto" }, components: ["Các gói dịch vụ được thiết kế riêng biệt để phù hợp với từng giai đoạn phát triển của doanh nghiệp bạn."] },
                    { 
                      type: "services", 
                      attributes: { "data-gjs-type": "services" },
                      binding: { category: "marketing" },
                      design: { layout: "grid", columns: 3 }
                    }
                  ]}
                ]
              },
              {
                tagName: "section",
                attributes: { class: "py-24 bg-white" },
                components: [
                  { tagName: "div", attributes: { class: "container mx-auto px-4 max-w-xl" }, components: [
                    { tagName: "h2", attributes: { class: "text-3xl font-bold text-center mb-4 text-gray-900" }, components: ["Đăng Ký Nhận Báo Giá"] },
                    { tagName: "p", attributes: { class: "text-center text-gray-600 mb-10" }, components: ["Để lại thông tin, đội ngũ chuyên gia của chúng tôi sẽ phân tích và liên hệ tư vấn chiến lược trong vòng 30 phút."] },
                    { 
                      type: "lead-form", 
                      attributes: { "data-gjs-type": "lead-form" },
                      binding: { source: "agency-landing", tag: "Hot Lead" },
                      design: { theme: "light" }
                    }
                  ]}
                ]
              },
              {
                tagName: "footer",
                attributes: { class: "py-12 bg-gray-900 text-gray-400 text-center border-t border-gray-800" },
                components: [
                  { tagName: "p", components: ["© 2026 Ong Vang Agency. All rights reserved."] }
                ]
              }
            ]
          }
        }
      ]
    }
  ],
  styles: []
};
