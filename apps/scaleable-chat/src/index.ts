import WebSocket, { WebSocketServer } from "ws";
import redis from "./redis";
const PORT = process.env.PORT || 8000;
console.log("PORT: ", PORT);
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
  recieverId: string;
}

redis.initRedis();

const rooms: Map<string, { sockets: WebSocket[] }> = new Map();
const subscribedRooms = new Set<string>();

const joinRoom = (data: JoinRoomPayload, socket: WebSocket) => {
  const { roomId } = data;

  if (!subscribedRooms.has(roomId)) {
    redis.subscriber.subscribe(roomId, (message) => {
      const parsed = JSON.parse(message);
      const targetRoomId = parsed.roomId;

      rooms.get(targetRoomId)?.sockets.forEach((clientSocket) => {
        clientSocket.send(message);
      });
    });
    subscribedRooms.add(roomId);
  }
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { sockets: [] });
  }

  rooms.get(roomId)?.sockets.push(socket);
};
const sendMessage = (data: SendMessagePayload, senderSocket: WebSocket) => {
  const { roomId } = data;
  console.log("Sending Message");
  redis.redisQueue.lPush("chat-queue", JSON.stringify(data));

  redis.publisher.publish(roomId, JSON.stringify(data));
};

wss.on("open", () => {
  console.log("Socket is open now on port ");
});

wss.on("connection", (socket: WebSocket) => {
  const userId = Date.now().toString();
  console.log("client connected and assigned a userId ", userId);

  socket.onmessage = (s) => {
    console.log("message ", JSON.parse(s.data.toString()));
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
