# Testing Guide

This project includes comprehensive unit and integration tests for the notification system.

## Setup

First, install testing dependencies:

```bash
npm install
```

## Running Tests

### Run all tests in watch mode:
```bash
npm run test
```

### Run tests once (CI mode):
```bash
npm run test:run
```

### Run tests with UI dashboard:
```bash
npm run test:ui
```

### Generate coverage report:
```bash
npm run test:coverage
```

## Test Structure

```
src/__tests__/
├── setup.ts                          # Test environment setup
├── mocks.ts                          # Mock objects for testing
├── unit/
│   ├── video.router.test.ts         # Unit tests for video router
│   └── queue.test.ts                # Unit tests for queue
└── integration/
    └── notification-flow.test.ts    # Integration tests for full flow
```

## What's Being Tested

### Unit Tests (`src/__tests__/unit/`)

#### **video.router.test.ts**
- Creating videos and adding notifications to queue
- Handling invalid YouTube URLs
- Extracting YouTube IDs from different URL formats
- Fetching YouTube video titles
- Getting all videos with users and votes
- Getting latest video by current user

#### **queue.test.ts**
- Adding notification jobs to queue
- Handling job failures
- Processing notification jobs
- Publishing notifications to Redis
- Handling large batches of notifications

### Integration Tests (`src/__tests__/integration/`)

#### **notification-flow.test.ts**
- Complete notification flow: create video → queue → Redis → Socket
- Multiple concurrent video creations
- Redis subscription and message handling
- Recovery from queue/Redis failures
- Proper serialization/deserialization of notification data
- Broadcasting notifications to all connected Socket clients

## Test Coverage

The current test suite covers:
- ✅ Video creation and database operations
- ✅ Queue management and job processing
- ✅ Redis pub/sub communication
- ✅ Socket.io broadcasting
- ✅ Error handling and recovery
- ✅ Concurrent operations
- ✅ Data serialization

## Mocked Dependencies

The tests mock the following services:
- **Prisma Client** - Database operations
- **Redis** - Pub/Sub messaging
- **BullMQ** - Job queue
- **Socket.io** - Real-time communication

This allows tests to run without requiring external services.

## Writing New Tests

When adding new tests:

1. Create test file in appropriate directory (`unit/` or `integration/`)
2. Import required mocks from `src/__tests__/mocks.ts`
3. Mock external dependencies using `vi.mock()`
4. Use descriptive test names with `describe()` and `it()`
5. Follow the AAA pattern (Arrange, Act, Assert)

Example:
```typescript
import { describe, it, expect, vi } from "vitest";
import { mockQueue } from "../mocks";

vi.mock("~/server/queue", () => ({
  notificationQueue: mockQueue,
}));

describe("My Feature", () => {
  it("should do something", async () => {
    // Arrange
    const data = { test: "data" };
    
    // Act
    const result = await mockQueue.add("job", data);
    
    // Assert
    expect(result).toBeDefined();
  });
});
```

## CI/CD Integration

For continuous integration, use:
```bash
npm run test:run && npm run test:coverage
```

This will:
1. Run all tests once (no watch mode)
2. Generate coverage report
3. Exit with appropriate code (0 = success, 1 = failure)

## Troubleshooting

### Tests not running
```bash
npm install
npm run test:run
```

### Coverage report not generated
```bash
npm run test:coverage
```

### Specific test failing
```bash
npm run test -- src/__tests__/unit/video.router.test.ts
```

## Next Steps

After running tests locally:
1. Check the coverage report: `coverage/index.html`
2. Improve coverage by adding more edge cases
3. Run tests in CI pipeline before deployment
