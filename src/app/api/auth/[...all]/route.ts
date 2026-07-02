import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const handlers = toNextJsHandler(auth);

function withNoStore(response: Response) {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export async function GET(request: Request) {
  return withNoStore(await handlers.GET(request));
}

export async function POST(request: Request) {
  return withNoStore(await handlers.POST(request));
}
