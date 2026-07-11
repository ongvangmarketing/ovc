import Redis from "ioredis";

// Cache connection in development to prevent hot-reloading from creating too many connections
const globalForRedis = global as unknown as { redis: Redis };

const redisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

export const redis =
  globalForRedis.redis ||
  new Redis(process.env.REDIS_URL || "redis://localhost:6379", redisOptions);

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
