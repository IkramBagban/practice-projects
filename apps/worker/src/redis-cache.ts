import {
  createClient,
  RedisClientType,
  RedisFunctions,
  RedisModules,
} from "redis";

export class RedisCache {
  private static instance: RedisCache;
  private redisClient;

  private constructor() {
    console.log("initializing redis cache...");
    this.redisClient = createClient();
    this.redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });
    this.connect();
  }

  private async connect() {
    if (!this.redisClient.isOpen) {
      await this.redisClient.connect();
      console.log("redis connected successfully.");
    }
  }

  static getInstance() {
    if (RedisCache.instance) {
      return RedisCache.instance;
    }

    RedisCache.instance = new RedisCache();
    return RedisCache.instance;
  }

  set(key: string, value: any) {
    console.log("setting...");
    try {
      this.redisClient.set(key, JSON.stringify(value));
    } catch (error) {
      console.log(`provided value for key ${key} is not valid json`);
    }
  }

  async get(key: string) {
    console.log("getting...");

    try {
      const value = await this.redisClient.get(key);
      return JSON.parse(value!);
    } catch (error) {
      console.log(`Error parsing the value for the key ${key}`);
      return null;
    }
  }

  del(key: string) {
    console.log("deleting...");
    this.redisClient.del(key);
  }
}

export const redisCache = RedisCache.getInstance();
