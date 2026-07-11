import { NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db';
import { defaultTemplates } from '@/actions/default-templates';

export async function GET() {
  try {
    const db = getTenantDb();
    
    for (const t of defaultTemplates) {
      await db.emailTemplate.updateMany({
        where: { code: t.code },
        data: {
          body: t.body,
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
