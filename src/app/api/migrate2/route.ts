import { NextResponse } from "next/server";
import { getSystemDb } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function POST() {
  const db = getSystemDb();
  
  try {
    const orgId = "cmqymbvt00000r6m99oyaf3sn"; // example
    const userId = "cmqymbvt00000r6m99oyaf3sq"; // example
    const accessRecords = await db.resourceAccess.findMany({
      take: 5
    });
    return NextResponse.json({ success: true, accessRecords });
  } catch (error: any) {
    console.error("TEST ERROR:", error);
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
  }
}
