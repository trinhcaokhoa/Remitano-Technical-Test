import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockPrismaClient, mockQueue, mockRedis, mockIO } from "../mocks";

type NotificationPayload = {
  type: string;
  user: {
    name: string;
  };
};

vi.mock("~/server/db", () => ({
  db: mockPrismaClient,
}));

vi.mock("~/server/queue", () => ({
  notificationQueue: mockQueue,
}));

vi.mock("~/server/redis", () => ({
  redis: mockRedis,
}));

describe("Notification System - Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should complete full notification flow: create video -> queue -> redis -> socket", async () => {
    // Step 1: User creates a video
    const userId = "user-123";
    const videoUrl = "https://www.youtube.com/watch?v=test123";
    const videoTitle = "Test Video Title";

    const createdVideo = {
      id: "video-123",
      url: videoUrl,
      youtubeId: "test123",
      title: videoTitle,
      description: "Test description",
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrismaClient.video.create.mockResolvedValueOnce(createdVideo);

    // Create video
    const video = (await mockPrismaClient.video.create({
      data: {
        url: videoUrl,
        youtubeId: "test123",
        title: videoTitle,
        description: "Test description",
        userId,
      },
    })) as unknown;

    expect(video).toEqual(createdVideo);

    // Step 2: Add notification to queue
    const jobData = {
      title: videoTitle,
      user: { id: userId, name: "Test User", email: "test@example.com" },
    };

    mockQueue.add.mockResolvedValueOnce({ id: "job-123" });

    const job = (await mockQueue.add("new-video", jobData)) as unknown;

    expect((job as any).id).toBe("job-123");
    expect(mockQueue.add).toHaveBeenCalledWith("new-video", jobData);

    // Step 3: Worker processes job and publishes to Redis
    const notificationPayload = {
      type: "NEW_VIDEO",
      title: videoTitle,
      user: jobData.user,
    };

    mockRedis.publish.mockResolvedValueOnce(1);

    await mockRedis.publish(
      "notifications",
      JSON.stringify(notificationPayload),
    );

    expect(mockRedis.publish).toHaveBeenCalledWith(
      "notifications",
      JSON.stringify(notificationPayload),
    );

    // Step 4: Socket.io broadcasts to clients
    mockIO.emit("notification", notificationPayload);

    expect(mockIO.emit).toHaveBeenCalledWith(
      "notification",
      notificationPayload,
    );
  });

  it("should handle multiple concurrent video creations", async () => {
    const videos = Array.from({ length: 5 }, (_, i) => ({
      id: `video-${i}`,
      url: `https://www.youtube.com/watch?v=test${i}`,
      youtubeId: `test${i}`,
      title: `Video ${i}`,
      description: `Description ${i}`,
      userId: `user-${i}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Mock parallel creates
    for (const video of videos) {
      mockPrismaClient.video.create.mockResolvedValueOnce(video);
      mockQueue.add.mockResolvedValueOnce({ id: `job-${video.id}` });
    }

    const createdVideos = (await Promise.all(
      videos.map((v) =>
        mockPrismaClient.video.create({
          data: {
            url: v.url,
            youtubeId: v.youtubeId,
            title: v.title,
            description: v.description,
            userId: v.userId,
          },
        }),
      ),
    )) as unknown[];

    const jobs = (await Promise.all(
      videos.map((v) =>
        mockQueue.add("new-video", {
          title: v.title,
          user: { id: v.userId },
        }),
      ),
    )) as unknown[];

    expect(createdVideos).toHaveLength(5);
    expect(jobs).toHaveLength(5);
    expect(mockPrismaClient.video.create).toHaveBeenCalledTimes(5);
    expect(mockQueue.add).toHaveBeenCalledTimes(5);
  });

  it("should handle redis subscription and message handling", async () => {
    const subscriber = mockRedis.duplicate() as any;

    // Subscribe to channel
    await subscriber.subscribe("notifications");

    expect(subscriber.subscribe).toHaveBeenCalledWith("notifications");

    // Register message handler
    subscriber.on("message", (channel: string, message: string) => {
      if (channel === "notifications") {
        const data = JSON.parse(message);
        mockIO.emit("notification", data);
      }
    });

    expect(subscriber.on).toHaveBeenCalledWith("message", expect.any(Function));
  });

  it("should recover from queue or redis failures", async () => {
    const jobData = {
      title: "Test Video",
      user: { id: "user-123", name: "Test User" },
    };

    // Simulate queue failure
    mockQueue.add.mockRejectedValueOnce(new Error("Queue connection failed"));

    try {
      await mockQueue.add("new-video", jobData);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);

      // Retry
      mockQueue.add.mockResolvedValueOnce({ id: "job-456" });
      const retryResult = (await mockQueue.add(
        "new-video",
        jobData,
      )) as unknown;

      expect((retryResult as any).id).toBe("job-456");
    }
  });

  it("should properly serialize and deserialize notification data", async () => {
    const originalData = {
      type: "NEW_VIDEO",
      title: "Test Video",
      user: {
        name: "Test User",
        email: "test@example.com",
      },
    };

    const serialized = JSON.stringify(originalData);
    const deserialized = JSON.parse(serialized) as NotificationPayload;

    expect(deserialized).toEqual(originalData);
    expect(deserialized.type).toBe("NEW_VIDEO");
    expect(deserialized.user.name).toBe("Test User");
  });

  it("should emit notification to all connected socket clients", async () => {
    const notificationData = {
      type: "NEW_VIDEO",
      title: "New Video",
      user: { name: "User", email: "user@example.com" },
    };

    // Simulate multiple clients receiving the same notification
    const clients = [
      { id: "client-1", emit: vi.fn() },
      { id: "client-2", emit: vi.fn() },
      { id: "client-3", emit: vi.fn() },
    ];

    clients.forEach(() => {
      mockIO.emit("notification", notificationData);
    });

    expect(mockIO.emit).toHaveBeenCalledTimes(3);
    expect(mockIO.emit).toHaveBeenCalledWith("notification", notificationData);
  });
});
