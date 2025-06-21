import { createClient } from "redis";
const publisher = createClient();
const subscriber = createClient();
const redisQueue = createClient();

const initRedis = async () => {
  await publisher.connect();
  await subscriber.connect();
  await redisQueue.connect();
};

export default { publisher, subscriber, redisQueue, initRedis };
