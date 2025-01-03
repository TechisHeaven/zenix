import { createClient, RedisClientType } from "redis";

// Create a Redis client
export const redis: RedisClientType = createClient();

redis.on("error", (err) => {
  console.log("Redis Client Error", err);
});

// Async function to connect to Redis
export const connectRedis = async () => {
  try {
    await redis.connect();
    console.log("Redis connected successfully");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
};
