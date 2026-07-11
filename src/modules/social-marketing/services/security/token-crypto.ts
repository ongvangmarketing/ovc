import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

type TokenEnvelope = {
  ciphertext: string;
  iv: string;
  authTag: string;
  keyVersion: string;
};

function encryptionKey() {
  const secret = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY || process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("Chưa cấu hình khóa mã hóa Social Marketing.");
  }
  return createHash("sha256").update(secret).digest();
}

export function encryptSocialToken(token: string): TokenEnvelope {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    keyVersion: "v1",
  };
}

export function decryptSocialToken(envelope: TokenEnvelope) {
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(envelope.iv, "base64"));
  decipher.setAuthTag(Buffer.from(envelope.authTag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(envelope.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

