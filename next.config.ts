import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: { maxEntries: 4, maxAgeSeconds: 31536000 },
        },
      },
      {
        urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-font-assets",
          expiration: { maxEntries: 4, maxAgeSeconds: 604800 },
        },
      },
      {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-image-assets",
          expiration: { maxEntries: 64, maxAgeSeconds: 86400 },
        },
      },
      {
        urlPattern: /\/_next\/image\?url=.+$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "next-image",
          expiration: { maxEntries: 64, maxAgeSeconds: 86400 },
        },
      },
      {
        urlPattern: /\.(?:mp3|wav|ogg)$/i,
        handler: "CacheFirst",
        options: {
          rangeRequests: true,
          cacheName: "static-audio-assets",
          expiration: { maxEntries: 32, maxAgeSeconds: 86400 },
        },
      },
      {
        urlPattern: /\.(?:mp4)$/i,
        handler: "CacheFirst",
        options: {
          rangeRequests: true,
          cacheName: "static-video-assets",
          expiration: { maxEntries: 32, maxAgeSeconds: 86400 },
        },
      },
      {
        urlPattern: /\.(?:js)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-js-assets",
          expiration: { maxEntries: 32, maxAgeSeconds: 86400 },
        },
      },
      {
        urlPattern: /\.(?:css|less)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-style-assets",
          expiration: { maxEntries: 32, maxAgeSeconds: 86400 },
        },
      },
      {
        urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "next-data",
          expiration: { maxEntries: 32, maxAgeSeconds: 86400 },
        },
      },
      {
        urlPattern: /\.(?:json|xml|csv)$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "static-data-assets",
          expiration: { maxEntries: 32, maxAgeSeconds: 86400 },
        },
      },
      {
        urlPattern: ({ url }) => {
          const isSameOrigin = self.origin === url.origin;
          if (!isSameOrigin) return false;
          const pathname = url.pathname;
          if (pathname.startsWith("/api/")) return true;
          return false;
        },
        handler: "NetworkFirst",
        method: "GET",
        options: {
          cacheName: "apis",
          expiration: { maxEntries: 16, maxAgeSeconds: 86400 },
          networkTimeoutSeconds: 10, 
        },
      },
      {
        urlPattern: ({ url }) => {
          const isSameOrigin = self.origin === url.origin;
          if (!isSameOrigin) return false;
          const pathname = url.pathname;
          if (pathname.startsWith("/api/auth/") || pathname.startsWith("/login") || pathname.startsWith("/register")) return false;
          return true;
        },
        handler: "NetworkFirst",
        options: {
          cacheName: "others",
          expiration: { maxEntries: 32, maxAgeSeconds: 86400 },
          networkTimeoutSeconds: 10,
        },
      },
    ],
  }
});

const serverActionAllowedOrigins = process.env.NEXT_SERVER_ACTION_ALLOWED_ORIGINS
  ?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit"],
  async redirects() {
    return [
      { source: "/workspace/dashboard", destination: "/myworks", permanent: false },
      { source: "/workspace/myworks", destination: "/myworks", permanent: false },
      { source: "/workspace/tasks/:path*", destination: "/tasks/:path*", permanent: false },
      { source: "/workspace/calendar/:path*", destination: "/calendar/:path*", permanent: false },
      { source: "/workspace/timeline/:path*", destination: "/timeline/:path*", permanent: false },
      { source: "/workspace/leads/:path*", destination: "/leads/:path*", permanent: false },
      { source: "/workspace/crm/:path*", destination: "/crm/:path*", permanent: false },
      { source: "/workspace/projects/:path*", destination: "/projects/:path*", permanent: false },
      { source: "/workspace/finance/:path*", destination: "/finance/:path*", permanent: false },
      { source: "/workspace/training/:path*", destination: "/training/:path*", permanent: false },
      { source: "/workspace/courses/:path*", destination: "/courses/:path*", permanent: false },
      { source: "/workspace/marketing/:path*", destination: "/marketing/:path*", permanent: false },
      { source: "/workspace/social-marketing/:path*", destination: "/social-marketing/:path*", permanent: false },
      { source: "/workspace/website/:path*", destination: "/website/:path*", permanent: false },
      { source: "/workspace/settings/:path*", destination: "/settings/:path*", permanent: false },
      { source: "/workspace/services/:path*", destination: "/services/:path*", permanent: false },
    ];
  },
  async rewrites() {
    return [
      { source: "/dashboard", destination: "/" },
      { source: "/myworks", destination: "/workspace/myworks" },
      { source: "/tasks/:path*", destination: "/workspace/tasks/:path*" },
      { source: "/calendar/:path*", destination: "/workspace/calendar/:path*" },
      { source: "/timeline/:path*", destination: "/workspace/timeline/:path*" },
      { source: "/leads/:path*", destination: "/workspace/leads/:path*" },
      { source: "/crm/:path*", destination: "/workspace/crm/:path*" },
      { source: "/projects/:path*", destination: "/workspace/projects/:path*" },
      { source: "/finance/:path*", destination: "/workspace/finance/:path*" },
      { source: "/training/:path*", destination: "/workspace/training/:path*" },
      { source: "/courses/:path*", destination: "/workspace/courses/:path*" },
      { source: "/marketing/:path*", destination: "/workspace/marketing/:path*" },
      { source: "/social-marketing/:path*", destination: "/workspace/social-marketing/:path*" },
      { source: "/website/:path*", destination: "/workspace/website/:path*" },
      { source: "/settings/:path*", destination: "/workspace/settings/:path*" },
      { source: "/services/:path*", destination: "/workspace/services/:path*" },
    ];
  },
  async headers() {
    return [
      {
        // API routes & auth: never cache
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
      {
        // HTML pages: no-store so users always get fresh content
        source: "/((?!_next/static|_next/image|favicon.ico).*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "24mb",
      allowedOrigins: serverActionAllowedOrigins?.length ? serverActionAllowedOrigins : undefined,
    },
  },
  images: {
    remotePatterns: [
      { hostname: "avatars.githubusercontent.com" },
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "utfs.io" },
      { hostname: "images.unsplash.com" },
      { hostname: "res.cloudinary.com" },
    ],
  },
  turbopack: {},
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
};

const finalConfig = withPWA(nextConfig);
finalConfig.typescript = { ignoreBuildErrors: true };
export default finalConfig;
