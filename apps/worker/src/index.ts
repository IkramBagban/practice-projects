import express from "express";
import { createClient } from "redis";
import { data, storeManager } from "./store";
import { redisCache } from "./redis-cache";

storeManager.startLogger();
let totalRequestProcessByThisServer = 0;
const main = async () => {
  const client = await createClient();
  client.connect();

  while (true) {
    const response = await client.brPop("submissions", 0);
    // console.log("Response", response);
    const submission = JSON.parse(response?.element!);

    await new Promise((resolve) =>
      setTimeout(() => {
        redisCache.set(
          `submission:${submission?.problemId}:${submission.userId}`,
          submission
        );
        storeManager.addSubmission(submission);
        storeManager.increaseProcessReq();
        resolve("asfd");
      }, 1000)
    );
    console.log("Processed users submission");
  }
};

main();
