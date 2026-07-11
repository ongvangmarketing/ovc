import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { SecretEnvelope } from "../types/ai.types";

function key() {
  const secret = process.env.AI_SECRET_ENCRYPTION_KEY || process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("Thiếu AI_SECRET_ENCRYPTION_KEY hoặc BETTER_AUTH_SECRET.");
  return createHash("sha256").update(secret).digest();
}

export class AIEncryptionService {
  static encrypt(value: string): SecretEnvelope {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key(), iv);
    const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
    return {
      version: 1,
      algorithm: "aes-256-gcm",
      iv: iv.toString("base64"),
      tag: cipher.getAuthTag().toString("base64"),
      ciphertext: ciphertext.toString("base64"),
    };
  }

  static decrypt(envelope: SecretEnvelope) {
    const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(envelope.iv, "base64"));
    decipher.setAuthTag(Buffer.from(envelope.tag, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(envelope.ciphertext, "base64")),
      decipher.final(),
    ]).toString("utf8");
  }
}
