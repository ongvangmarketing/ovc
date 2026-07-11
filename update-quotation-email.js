const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const newBody = `Xin chào <strong>{{customer_name}}</strong>,<br><br>Chúng tôi xin gửi đến Quý khách Báo giá mới <strong>{{quotation_number}}</strong> từ hệ thống của chúng tôi.<br>Giá trị báo giá: <strong>{{quotation_total}}</strong>.<br><br>Quý khách vui lòng kiểm tra chi tiết các hạng mục và thực hiện ký xác nhận trực tuyến để chúng tôi có thể tiến hành các bước tiếp theo.<br><br><div style="text-align: center; margin: 32px 0;"><a href="{{quotation_link}}" style="background-color: #000000; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">Xem và Ký Báo Giá</a></div>`;

async function main() {
  await prisma.emailTemplate.updateMany({
    where: { code: 'QUOTATION_SIGN_REQUEST_SENT' },
    data: { body: newBody }
  });
  console.log("Updated QUOTATION_SIGN_REQUEST_SENT!");
}
main().finally(() => prisma.$disconnect());
