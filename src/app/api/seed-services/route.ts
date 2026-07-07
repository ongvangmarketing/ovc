import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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
      return NextResponse.json({ message: 'Successfully inserted SERVICES module.' });
    }
    return NextResponse.json({ message: 'SERVICES module already exists.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
