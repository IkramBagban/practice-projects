import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "chat-app",
  brokers: ["localhost:9092"],
  retry: {
    retries: 3,
    initialRetryTime: 100,
    factor: 2,
  },
});

const producer = kafka.producer({
  retry: {
    retries: 3,
  },
});

const consumer = kafka.consumer({
  groupId: "chat-app-group",
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
});

const admin = kafka.admin();

export default {
  kafka,
  producer,
  consumer,
  admin,
};