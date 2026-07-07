import { db } from './src/lib/db';
async function main() {
  const code = 'SERVICES';
  const existing = await db.platformModule.findUnique({ where: { code } });
  if (!existing) {
    await db.platformModule.create({
      data: {
        code,
        name: 'Dịch vụ (Catalog)',
        version: '1.0.0',
        category: 'CRM',
        description: 'Quản lý danh mục dịch vụ, tùy chọn và cấu hình báo giá.',
        icon: 'layers-3',
        dependencies: ['CRM'],
        sortOrder: 25,
      }
    });
    console.log('Successfully inserted SERVICES module.');
  } else {
    console.log('SERVICES module already exists.');
  }
}
main().catch(console.error).finally(() => process.exit());

