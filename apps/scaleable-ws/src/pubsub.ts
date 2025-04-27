import { createClient } from "redis";
export class PubsubManager {
  publishClient;
  subscribeClient;
  subscribedChannels: Set<string>;
  private static instance: PubsubManager;
  constructor() {
    this.publishClient = createClient();
    this.subscribeClient = createClient();
    this.subscribedChannels = new Set();

    this.publishClient.on("error", (e) => {
      console.log("Error while connecting publish client", e);
    });
    this.subscribeClient.on("error", (e) => {
      console.log("Error while connecting publish client", e);
    });

    this.connectClients();
  }

  static getInstance() {
    if (!PubsubManager.instance) {
      PubsubManager.instance = new PubsubManager();
    }
    console.log("pub sub initilaized");
    return PubsubManager.instance;
  }
  async connectClients() {
    await Promise.all([
      await this.publishClient.connect(),
      await this.subscribeClient.connect(),
    ]);

    console.log("pub sub clients connected");
  }

  async publish(channel: string, message: string) {
    await this.publishClient.publish(channel, JSON.stringify(message));
  }

  async subscribe(channel: string, cb: (msg: any) => void) {
    if (this.subscribedChannels.has(channel))
      return console.log(`Already subscribed to channel: ${channel}`);
    this.subscribedChannels.add(channel);
    await this.subscribeClient.subscribe(channel, (msg) => {
      console.log(`[listener]: Received message from channel ${channel}`, msg);
      cb(msg);
    });
  }

  async unsubscribe(channel: string) {
    try {
      await this.subscribeClient.unsubscribe(channel);
      this.subscribedChannels.delete(channel);
    } catch (error) {
      console.log("error while unsubscribing");
    }
  }
}

export const pubsubManager = PubsubManager.getInstance();
