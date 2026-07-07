import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/service";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const authAllowedHosts = Array.from(new Set([
  "app.ovc.vn",
  "app.ongvang.com.vn",
  "app.tralist.vn",
  "localhost",
  "127.0.0.1",
  ...(process.env.BETTER_AUTH_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean),
]));
const trustedOrigins = Array.from(new Set([
  appUrl,
  "https://app.ovc.vn",
  "https://app.ongvang.com.vn",
  "https://app.tralist.vn",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]));

function requestOrigin(request?: Request) {
  if (!request) return null;
  const origin = request.headers.get("origin");
  if (origin) return origin;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host) return null;
  const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export const auth = betterAuth({
  baseURL: {
    allowedHosts: authAllowedHosts,
    fallback: appUrl,
    protocol: "auto",
  },
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url, token }, request) => {
      // Find the user's first organization to use its email settings
      const member = await db.organizationMember.findFirst({
        where: { userId: user.id },
      });
      
      const resetUrl = `${appUrl}/reset-password?token=${token}`;
      
      await sendEmail({
        organizationId: member?.organizationId || "", // We might need a fallback or skip if no org, but system requires it
        to: user.email,
        subject: "Khôi phục mật khẩu tài khoản",
        html: `
          <div style="font-family: sans-serif; max-w-xl; margin: 0 auto; color: #333;">
            <h2 style="color: #0f172a;">Yêu cầu khôi phục mật khẩu</h2>
            <p>Chào ${user.name || user.email},</p>
            <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn. Vui lòng bấm vào nút bên dưới để đặt lại mật khẩu mới:</p>
            <div style="margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Đặt lại mật khẩu
              </a>
            </div>
            <p style="font-size: 13px; color: #64748b;">Nếu bạn không yêu cầu điều này, bạn có thể bỏ qua email này một cách an toàn. Mật khẩu của bạn sẽ không bị thay đổi.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            <p style="font-size: 12px; color: #94a3b8;">
              Liên kết này sẽ hết hạn sau một khoảng thời gian ngắn.<br/>
              Bạn đang gặp sự cố? Hãy liên hệ với Quản trị viên của bạn.
            </p>
          </div>
        `,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },
  plugins: [organization()],
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh every day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // cache session in cookie for 5 minutes
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "CUSTOMER",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      isActive: {
        type: "boolean",
        defaultValue: true,
        required: false,
      },
      onboarded: {
        type: "boolean",
        defaultValue: false,
        required: false,
      },
    },
  },
  trustedOrigins: async (request) => {
    const origin = requestOrigin(request);
    return origin ? Array.from(new Set([...trustedOrigins, origin])) : trustedOrigins;
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
