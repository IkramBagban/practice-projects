import WebSocket, { WebSocketServer } from "ws";
import redis from "./redis";
const PORT = process.env.PORT || 7890;
console.log('PORT: ', PORT)
const wss = new WebSocketServer({ port: PORT as number });

enum MessageType {
  JOIN_ROOM = "JOIN_ROOM",
  SEND_MESSAGE = "SEND_MESSAGE",
}

interface JoinRoomPayload {
  type: MessageType.JOIN_ROOM;
  roomId: string;
}
interface SendMessagePayload {
  type: MessageType.SEND_MESSAGE;
  message: string;
  roomId: string;
}

redis.initRedis();

const rooms: Map<string, { sockets: WebSocket[] }> = new Map();

redis.subscriber.on("message", (channel, message) => {
  console.log("subcriber on messages", { channel, message });
});

const joinRoom = (data: JoinRoomPayload, socket: WebSocket) => {
  const { roomId } = data;
  console.log(`Joining room ${roomId}`);

  if (!rooms.has(roomId)) {
    console.log("Subscribing to channel: ", roomId);
    redis.subscriber.subscribe(roomId, (message) => {
      const parseData = JSON.parse(message);
      const roomId = parseData.roomId;
      rooms.get(roomId)?.sockets.forEach((socket) => {
        socket.send(message);
      });
      console.info("[info]: subscribed to channel", message);
    });
    rooms.set(roomId, { sockets: [] });
  }
  rooms.get(roomId)?.sockets.push(socket);
};

const sendMessage = (data: SendMessagePayload, senderSocket: WebSocket) => {
  const { roomId } = data;
  console.log("Sending Message");
  redis.publisher.publish(roomId, JSON.stringify(data));

  // const room = rooms.get(roomId);
  // room?.sockets.forEach((socket) => {
  //   if (senderSocket !== socket) socket.send(JSON.stringify(data));
  // });
};

wss.on("open", () => {
  console.log("Socket is open now on port ");
});
wss.on("connection", (socket: WebSocket) => {
  const userId = Date.now().toString();
  console.log("client connected and assigned a userId ", userId);

  socket.onmessage = (s) => {
    console.log("got the message ", JSON.parse(s.data.toString()));
  };

  socket.on("message", (data: WebSocket.RawData) => {
    const parsedData = JSON.parse(data.toString());
    console.log("[info]: parsedData", parsedData);

    switch (parsedData.type) {
      case MessageType.JOIN_ROOM:
        joinRoom(parsedData, socket);
        break;
      case MessageType.SEND_MESSAGE:
        sendMessage(parsedData, socket);
        break;
    }
  });
});
