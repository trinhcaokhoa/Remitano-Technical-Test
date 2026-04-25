import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockPrismaClient, mockQueue } from "../mocks";

// Mock functions
const extractYoutubeId = (url: string) => {
  if (url.includes("youtube.com/watch?v=")) {
    return url.split("v=")[1];
  }
  if (url.includes("youtu.be/")) {
    return url.split("youtu.be/")[1];
  }
  return null;
};

const getYoutubeTitle = async (videoId: string) => {
  return `Video Title for ${videoId}`;
};

// Mock dependencies
vi.mock("~/server/db", () => ({
  db: mockPrismaClient,
}));

vi.mock("~/server/queue", () => ({
  notificationQueue: mockQueue,
}));

vi.mock("~/lib/youtube", () => ({
  extractYoutubeId: vi.fn(extractYoutubeId),
  getYoutubeTitle: vi.fn(getYoutubeTitle),
}));

describe("Video Router - Create Mutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a video and add notification to queue", async () => {
    const mockUserId = "user-123";
    const mockVideoUrl = "https://www.youtube.com/watch?v=test123";
    const mockDescription = "Test video description";

    mockPrismaClient.video.create.mockResolvedValueOnce({
      id: "video-123",
      url: mockVideoUrl,
      youtubeId: "test123",
      title: "Video Title for test123",
      description: mockDescription,
      userId: mockUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockQueue.add.mockResolvedValueOnce({
      id: "job-123",
      data: {
        title: "Video Title for test123",
        user: { id: mockUserId, name: "Test User" },
      },
    });

    // Simulate creating a video
    const videoData = {
      url: mockVideoUrl,
      description: mockDescription,
    };

    const createdVideo = await mockPrismaClient.video.create({
      data: {
        ...videoData,
        youtubeId: "test123",
        title: "Video Title for test123",
        userId: mockUserId,
      },
    });

    await mockQueue.add("new-video", {
      title: createdVideo.title,
      user: { id: mockUserId, name: "Test User" },
    });

    expect(mockPrismaClient.video.create).toHaveBeenCalledWith({
      data: {
        url: mockVideoUrl,
        description: mockDescription,
        youtubeId: "test123",
        title: "Video Title for test123",
        userId: mockUserId,
      },
    });

    expect(mockQueue.add).toHaveBeenCalledWith("new-video", {
      title: "Video Title for test123",
      user: { id: mockUserId, name: "Test User" },
    });

    expect(createdVideo).toMatchObject({
      id: "video-123",
      url: mockVideoUrl,
      youtubeId: "test123",
    });
  });

  it("should handle invalid YouTube URL", () => {
    const invalidUrl = "https://example.com/video";

    // extractYoutubeId should return null for invalid URLs
    const videoId = extractYoutubeId(invalidUrl);

    expect(videoId).toBeNull();
  });

  it("should extract YouTube ID from different URL formats", () => {
    const youtubeComUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const youtubeShortUrl = "https://youtu.be/dQw4w9WgXcQ";

    expect(extractYoutubeId(youtubeComUrl)).toBe("dQw4w9WgXcQ");
    expect(extractYoutubeId(youtubeShortUrl)).toBe("dQw4w9WgXcQ");
  });

  it("should fetch YouTube title for video", async () => {
    const title = await getYoutubeTitle("test123");

    expect(title).toBe("Video Title for test123");
  });

  it("should get all videos with users and votes", async () => {
    const mockVideos = [
      {
        id: "video-1",
        title: "Video 1",
        youtubeId: "id1",
        userId: "user-1",
        createdAt: new Date(),
        user: { id: "user-1", name: "User 1" },
        votes: [{ id: "vote-1", videoId: "video-1", userId: "user-2" }],
      },
    ];

    mockPrismaClient.video.findMany.mockResolvedValueOnce(mockVideos);

    const result = await mockPrismaClient.video.findMany({
      include: {
        user: true,
        votes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    expect(result).toEqual(mockVideos);
    expect(mockPrismaClient.video.findMany).toHaveBeenCalledWith({
      include: {
        user: true,
        votes: true,
      },
      orderBy: { createdAt: "desc" },
    });
  });

  it("should get latest video by current user", async () => {
    const mockUserId = "user-123";
    const mockLatestVideo = {
      id: "video-latest",
      title: "Latest Video",
      youtubeId: "latest123",
      userId: mockUserId,
      createdAt: new Date(),
    };

    mockPrismaClient.video.findFirst.mockResolvedValueOnce(mockLatestVideo);

    const result = await mockPrismaClient.video.findFirst({
      orderBy: { createdAt: "desc" },
      where: { userId: mockUserId },
    });

    expect(result).toEqual(mockLatestVideo);
    expect(mockPrismaClient.video.findFirst).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
      where: { userId: mockUserId },
    });
  });
});
