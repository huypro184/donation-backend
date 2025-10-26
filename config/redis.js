const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis error:", err));

redisClient.connect()
  .then(() => console.log("Connected to Redis"))
  .catch((err) => console.error("Redis connect error:", err));

module.exports = redisClient;