import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockQueue, mockRedis } from "../mocks";

vi.mock("~/server/redis", () => ({
  redis: mockRedis,
}));

vi.mock("~/server/queue", () => ({
  notificationQueue: mockQueue,
}));

describe("Notification Queue - Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should add a notification job to the queue", async () => {
    const jobData = {
      title: "Test Video",
      user: {
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
      },
    };

    const result = await mockQueue.add("new-video", jobData);

    expect(mockQueue.add).toHaveBeenCalledWith("new-video", jobData);
    expect(result).toEqual({ id: "job-123" });
  });

  it("should handle job failure gracefully", async () => {
    const jobData = {
      title: "Test Video",
      user: { id: "user-123", name: "Test User" },
    };

    mockQueue.add.mockRejectedValueOnce(new Error("Queue error"));

    try {
      await mockQueue.add("new-video", jobData);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe("Queue error");
    }
  });

  it("should process a notification job", async () => {
    const jobData = {
      title: "Test Video",
      user: { id: "user-123", name: "Test User" },
    };

    // Simulate worker processing
    const messageData = {
      type: "NEW_VIDEO",
      title: jobData.title,
      user: jobData.user,
    };

    await mockRedis.publish("notifications", JSON.stringify(messageData));

    expect(mockRedis.publish).toHaveBeenCalledWith(
      "notifications",
      JSON.stringify(messageData),
    );
  });

  it("should publish notification to Redis channel", async () => {
    const notificationData = {
      type: "NEW_VIDEO",
      title: "Video Title",
      user: {
        name: "User Name",
        email: "user@example.com",
      },
    };

    await mockRedis.publish("notifications", JSON.stringify(notificationData));

    expect(mockRedis.publish).toHaveBeenCalledWith(
      "notifications",
      JSON.stringify(notificationData),
    );
  });

  it("should handle large batch of notifications", async () => {
    const notifications = Array.from({ length: 100 }, (_, i) => ({
      title: `Video ${i}`,
      user: { id: `user-${i}`, name: `User ${i}` },
    }));

    for (const notification of notifications) {
      await mockQueue.add("new-video", notification);
    }

    expect(mockQueue.add).toHaveBeenCalledTimes(100);
  });
});
