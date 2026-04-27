import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { redis } from "./redis";

const PORT = process.env.PORT ?? 3001;

const httpServer = createServer();

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
  },
});

httpServer.listen(PORT, () => {
  console.log(`Socket running on ${PORT}`);
});



// Subscribe to Redis pub/sub channel
const subscriber = redis.duplicate();

subscriber.on("message", (channel: string, message: string): void => {
  if (channel === "notifications") {
    try {
      const data = JSON.parse(message) as unknown;
      console.log("Broadcasting notification:", data);
      io.emit("notification", data);
    } catch (err) {
      console.error("Failed to parse notification message:", err);
    }
  }
});

void subscriber.subscribe(
  "notifications",
  (err: Error | null | undefined): void => {
    if (err) {
      console.error("Failed to subscribe to notifications channel:", err);
    } else {
      console.log("✓ Successfully subscribed to Redis notifications channel");
    }
  },
);

io.on("connection", (socket) => {
  console.log("✓ Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("✗ Client disconnected:", socket.id);
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

httpServer.listen(PORT, () => {
  console.log(`✓ Socket.io server listening on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", (): void => {
  console.log("Shutting down Socket.io server...");
  void subscriber.unsubscribe();
  void subscriber.quit();
  httpServer.close(() => {
    console.log("Socket.io server closed");
    process.exit(0);
  });
});
