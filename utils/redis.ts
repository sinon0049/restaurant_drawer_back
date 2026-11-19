import { RedisStore } from "connect-redis";
import { createClient } from "redis";

const redisClient = createClient({ url: process.env.REDIS_URL ?? '' });
redisClient.on("error", (err) => console.error("Redis error", err));
redisClient.connect().catch(console.error);

const redisStore = new RedisStore({ client: redisClient, prefix: "restaurant-drawer:" })
export { redisStore }