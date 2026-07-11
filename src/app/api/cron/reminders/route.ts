import { NextResponse } from "next/server";
import { ReminderScannerService } from "@/lib/automation/scanner.service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobsQueued = await ReminderScannerService.scanAndEnqueue();

    return NextResponse.json({ 
      success: true, 
      message: "Cronjob executed successfully",
      jobsQueued 
    });
  } catch (error: any) {
    console.error("[Scanner] Lỗi nghiêm trọng:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
