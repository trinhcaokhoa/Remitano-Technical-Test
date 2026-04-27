import { Queue } from "bullmq";
import { redis } from "./redis";

export const notificationQueue = new Queue("notification", {
  connection: redis,
});
