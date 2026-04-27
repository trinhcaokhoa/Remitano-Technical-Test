import { vi } from "vitest";

// Mock Prisma Client
export const mockPrismaClient = {
  video: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $disconnect: vi.fn(),
};

// Mock Redis
export const mockRedis = {
  publish: vi.fn().mockResolvedValue(1),
  subscribe: vi.fn().mockResolvedValue(1),
  unsubscribe: vi.fn().mockResolvedValue(1),
  duplicate: vi.fn().mockReturnValue({
    subscribe: vi.fn().mockResolvedValue(1),
    on: vi.fn(),
    quit: vi.fn().mockResolvedValue("OK"),
  }),
  quit: vi.fn().mockResolvedValue("OK"),
};

// Mock BullMQ Queue
export const mockQueue = {
  add: vi.fn().mockResolvedValue({ id: "job-123" }),
  process: vi.fn(),
  on: vi.fn(),
  close: vi.fn(),
};

// Mock Socket.io
export const mockSocket = {
  emit: vi.fn(),
  on: vi.fn(),
  close: vi.fn(),
  disconnect: vi.fn(),
};

export const mockIO = {
  emit: vi.fn(),
  on: vi.fn(),
  listen: vi.fn(),
  close: vi.fn(),
};
