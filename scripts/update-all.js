const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const templates = await prisma.emailTemplate.findMany();
  for (const t of templates) {
    if (t.code === 'QUOTATION_SIGN_REQUEST_SENT') {
      await prisma.emailTemplate.update({
        where: { id: t.id },
        data: {
          body: 'Chúng tôi xin gửi đến Quý khách Báo giá mới <strong>{{quotation_number}}</strong> từ hệ thống của chúng tôi.<br>Giá trị báo giá: <strong>{{quotation_total}}</strong>.<br><br>Quý khách vui lòng kiểm tra chi tiết các hạng mục và thực hiện ký xác nhận trực tuyến để chúng tôi có thể tiến hành các bước tiếp theo.'
        }
      });
    }
    if (t.code === 'CONTRACT_SIGN_REQUEST_SENT') {
      await prisma.emailTemplate.update({
        where: { id: t.id },
        data: {
          body: 'Hợp đồng <strong>{{contract_subject}}</strong> đã được soạn thảo thành công. Giá trị hợp đồng: <strong>{{contract_value}}</strong>.<br><br>Chúng tôi xin gửi đến Quý khách bản Hợp đồng điện tử. Quý khách vui lòng truy cập vào đường dẫn bên dưới để xem chi tiết các điều khoản và thực hiện ký điện tử xác nhận.'
        }
      });
    }
  }
  
  await prisma.setting.deleteMany({
    where: { key: 'email_global_layout' }
  });
  console.log("Deleted old global layouts");
}
main().finally(() => prisma.$disconnect());
