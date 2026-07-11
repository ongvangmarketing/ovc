import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

type OAuthState = {
  organizationId: string;
  userId: string;
  nonce: string;
  expiresAt: number;
};

function stateSecret() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET chưa được cấu hình.");
  return secret;
}

export function createOAuthState(organizationId: string, userId: string) {
  const payload: OAuthState = {
    organizationId,
    userId,
    nonce: randomBytes(18).toString("base64url"),
    expiresAt: Date.now() + 10 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", stateSecret()).update(encoded).digest("base64url");
  return { value: `${encoded}.${signature}`, payload };
}

export function verifyOAuthState(value: string): OAuthState {
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) throw new Error("OAuth state không hợp lệ.");
  const expected = createHmac("sha256", stateSecret()).update(encoded).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    throw new Error("OAuth state không hợp lệ.");
  }
  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as OAuthState;
  if (!payload.organizationId || !payload.userId || !payload.nonce || payload.expiresAt < Date.now()) {
    throw new Error("OAuth state đã hết hạn.");
  }
  return payload;
}

