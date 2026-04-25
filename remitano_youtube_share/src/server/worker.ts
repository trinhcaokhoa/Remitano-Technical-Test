import { Worker } from "bullmq";
import { redis } from "./redis";

console.log("Worker started...");

new Worker(
  "notification",
  async (job) => {
    const { title, user } = job.data;

    console.log("Processing:", title);

    await redis.publish(
      "notifications",
      JSON.stringify({
        type: "NEW_VIDEO",
        title: job.data.title,
        user: job.data.user,
      }),
    );
  },
  {
    connection: redis,
  },
);
