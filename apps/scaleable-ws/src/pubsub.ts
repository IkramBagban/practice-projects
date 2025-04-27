import { createClient } from "redis";
export class PubsubManager {
  publishClient;
  subscribeClient;
  private static instance: PubsubManager;
  constructor() {
    this.publishClient = createClient();
    this.subscribeClient = createClient();

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
    Promise.all([
      await this.publishClient.connect(),
      await this.subscribeClient.connect(),
    ]);

    console.log("pub sub clients connected");
  }

  publish(channel: string, message: string) {
    this.publishClient.publish(channel, JSON.stringify(message));
  }

  subscribe(channel: string, cb: (msg: any) => void) {
    this.subscribeClient.subscribe(channel, cb);
  }
}

export const pubsubManager = PubsubManager.getInstance();
