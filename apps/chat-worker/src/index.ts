import { createClient } from "redis";
import prismaClient from "./db";
const init = async () => {
  console.log("Init");
  const queue = createClient();
  await queue.connect();

  while (1) {
    const data = await queue.brPop("chat-queue", 0);
    if (!data) return console.log("data is null");
    const parsedData = JSON.parse(data?.element);
    console.log("data", parsedData);

    const payload = { ...parsedData, type: undefined };
    await prismaClient.chat.create({
      data: payload,
    });
  }
};

init();
