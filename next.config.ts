import type { NextConfig } from "next";

const serverActionAllowedOrigins = process.env.NEXT_SERVER_ACTION_ALLOWED_ORIGINS
  ?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  experimental: serverActionAllowedOrigins?.length
    ? { serverActions: { allowedOrigins: serverActionAllowedOrigins } }
    : undefined,
  images: {
    remotePatterns: [
      { hostname: "avatars.githubusercontent.com" },
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "utfs.io" },
      { hostname: "images.unsplash.com" },
      { hostname: "res.cloudinary.com" },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
