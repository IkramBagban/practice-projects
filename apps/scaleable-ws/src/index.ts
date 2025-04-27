// @ts-nocheck
import { WebSocket, WebSocketServer } from "ws";
import { store } from "./store";
import { pubsubManager } from "./pubsub";

const wss = new WebSocketServer({ port: 9090 });

enum Actions {
  SEND_MESSAGE = "SEND_MESSAGE",
  SUBSCRIBE = "SUBSCRIBE",
  JOIN_ROOM = "JOIN_ROOM",
}

const safeParse = (data: any): any | null => {
  try {
    console.log("DATA", data);
    const parsedData = JSON.parse(data);
    return parsedData;
  } catch (error) {
    console.log("error while parsing the data", { error, data });
    return null;
  }
};
const safeStringify = (data: string): any | null => {
  try {
    const stringifiedData = JSON.stringify(data);
    return stringifiedData;
  } catch (error) {
    console.log("error while stringifying  the data", { error, data });
    return null;
  }
};

pubsubManager.subscribeClient.on("message", (channel, message) => {
  console.log("Received message from Redis:", { channel, message });
});

wss.on("connection", (socket: WebSocket) => {
  const userId = store.addUser(socket);
  socket.send("Your userid " + userId);

  socket.on("message", (data) => {
    const parsedData = JSON.parse(data.toString());

    switch (parsedData?.type) {
      case Actions.JOIN_ROOM:
        console.log("JOIN_ROOM", parsedData);
        store.joinRoom(userId, parsedData?.roomId, socket);
        pubsubManager.subscribe(parsedData?.roomId, (msg) => {
          store.getAllRoomUsers(parsedData?.roomId)?.forEach((userSocker) => {
            userSocker.send(msg);
          });
        });

        break;

      case Actions.SEND_MESSAGE:
        const { roomId, message } = parsedData;
        pubsubManager.publish(roomId, message);

      default:
        break;
    }
  });
});
