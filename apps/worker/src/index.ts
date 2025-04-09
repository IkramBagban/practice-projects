import express from "express";
import { createClient } from "redis";
import { data, storeManager } from "./store";
import { startLogger } from "./logger";

storeManager.startLogger();
const main = async () => {
  const client = await createClient();
  client.connect();

  while (true) {
    const response = await client.brPop("submissions", 0);
    console.log("Response", response);
    const submission = JSON.parse(response?.element!);

    await new Promise((resolve) =>
      setTimeout(() => {
        storeManager.addSubmission(submission);
        resolve("asfd");
      }, 1000)
    );
    console.log("Processed users submission");
  }
};

main();
