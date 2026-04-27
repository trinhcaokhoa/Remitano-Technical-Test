import { Worker } from "bullmq";
import { redis } from "./redis";

interface JobData {
  title: string;
  user: unknown;
}

console.log("Worker started...");

new Worker(
  "notification",
  async (job: { data: JobData }): Promise<void> => {
    const { title } = job.data;

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
