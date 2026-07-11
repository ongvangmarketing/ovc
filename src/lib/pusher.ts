import PusherServer from "pusher";
import PusherClient from "pusher-js";

// Khởi tạo Pusher Server (dùng trên backend/API/Server Actions)
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Hàm khởi tạo Pusher Client (dùng trên Frontend/React Components)
let pusherClientInstance: PusherClient | null = null;

export const getPusherClient = () => {
  if (typeof window === "undefined") {
    // Để an toàn nếu lỡ gọi SSR
    return null as unknown as PusherClient;
  }
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
  }
  return pusherClientInstance;
};
