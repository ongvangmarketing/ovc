import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { EventDispatcherService } from "@/lib/automation/event-dispatcher.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const expected = process.env.WORKFLOW_WORKER_SECRET;
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected || !provided) return false;
  const left = Buffer.from(expected);
  const right = Buffer.from(provided);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const eventIds = await EventDispatcherService.dispatchPending();
  return NextResponse.json({ processed: eventIds.length, eventIds });
}
