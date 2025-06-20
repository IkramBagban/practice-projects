import {createClient} from "redis";
const publisher = createClient();
const subscriber = createClient();

const initRedis = async () => {
  await publisher.connect();
  await subscriber.connect();
};

export default { publisher, subscriber, initRedis };
