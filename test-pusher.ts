import { config } from "dotenv";
config();

import PusherServer from "pusher";

const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

async function main() {
  try {
    await pusherServer.trigger("test-channel", "test-event", { message: "hello" });
    console.log("Success");
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
