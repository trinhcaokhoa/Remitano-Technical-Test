import { vi } from "vitest";

// Mock environment variables
process.env.NEXTAUTH_SECRET = "test-secret";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.REDIS_URL = "redis://localhost:6379";

// Global test setup
beforeAll(() => {
  console.log("Test suite started");
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  console.log("Test suite completed");
});
