const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 40px 0; background-color: #fafafa; -webkit-font-smoothing: antialiased; }
    .email-wrapper { max-width: 600px; margin: 0 auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    .email-container { background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; color: #171717; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04); }
    .header { padding: 32px 32px 24px 32px; border-bottom: 1px solid #eaeaea; }
    .body-content { padding: 32px; font-size: 14px; line-height: 1.6; color: #171717; }
    .body-content p { margin: 0 0 16px 0; }
    .body-content a { color: #000000; text-decoration: underline; font-weight: 500; }
    .body-content a:hover { color: #666666; }
    .footer { margin-top: 32px; padding: 0 32px; font-size: 13px; color: #888888; line-height: 1.6; text-align: center; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <!-- Header -->
      <div class="header">
        <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #171717; letter-spacing: -0.5px;">{{company_name}}</h1>
      </div>

      <!-- Body -->
      <div class="body-content">
        {{content}}
        {{meta_box}}
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0 0 8px 0;">
        Email tự động từ <strong>{{company_name}}</strong>. Vui lòng không trả lời trực tiếp email này.
      </p>
      <p style="margin: 0;">
        {{company_name}} &bull; {{company_address}} &bull; {{company_website}}
      </p>
    </div>
  </div>
</body>
</html>`;

async function main() {
  await prisma.systemSettings.update({
    where: { id: "global" },
    data: { email_global_layout: html }
  }).catch(() => {
    return prisma.systemSettings.create({
      data: { id: "global", email_global_layout: html }
    })
  });
  console.log("Updated!");
}
main().finally(() => prisma.$disconnect());
