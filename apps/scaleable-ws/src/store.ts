import { WebSocket } from "ws";
export class Store {
  private static instance: Store;
  subscriptions: Record<string, { ws: WebSocket; rooms: string[] }>;
  rooms: Map<string, WebSocket[]>;

  private constructor() {
    this.subscriptions = {};
    this.rooms = new Map();
  }

  static getInstance() {
    if (!Store.instance) {
      Store.instance = new Store();
    }

    return Store.instance;
  }
  addUser(ws: WebSocket): number {
    const id = Date.now() + Math.random();
    this.subscriptions[id] = { ws, rooms: [] };
    return id;
  }

  joinRoom(userId: number, roomId: string, ws: WebSocket) {
    console.log("JOiNING ROOM")
    this.subscriptions[userId].rooms.push(roomId);
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, []);
    }
    this.rooms.get(roomId)?.push(ws);
  }

  getAllRoomUsers(roomId: string) {
    const rooms = this.rooms.get(roomId);
    return rooms;
  }
}

export const store = Store.getInstance();
