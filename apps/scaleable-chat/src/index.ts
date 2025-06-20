import WebSocket, { WebSocketServer } from "ws";

const PORT = process.env.PORT || 7890;
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

const rooms: Map<string, { sockets: WebSocket[] }> = new Map();

const joinRoom = (data: JoinRoomPayload, socket: WebSocket) => {
  const { roomId } = data;

  if (!rooms.has(roomId)) {
    rooms.set(roomId, { sockets: [] });
  }
  rooms.get(roomId)?.sockets.push(socket);
};

const sendMessage = (data: SendMessagePayload, senderSocket: WebSocket) => {
  const { roomId } = data;
  console.log("Sending Message");

  const room = rooms.get(roomId);
  room?.sockets.forEach((socket) => {
    if (senderSocket !== socket) socket.send(JSON.stringify(data));
  });
};

wss.on("open", () => {
  console.log("Socket is open now on port ");
});
wss.on("connection", (socket: WebSocket) => {
  const userId = Date.now().toString();
  console.log("client connected and assigned a userId ", userId);
  console.log("aaa", MessageType.JOIN_ROOM);

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
        // wss.clients.forEach((w)=> w.send(JSON.stringify(parsedData)))

        break;
    }
  });
});
