import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { redis } from "./redis";

const PORT = process.env.SOCKET_PORT || 3001;

const httpServer = createServer();
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

console.log("Socket.io server starting on port", PORT);

// Subscribe to Redis pub/sub channel
const subscriber = redis.duplicate();

subscriber.on("message", (channel, message) => {
  if (channel === "notifications") {
    try {
      const data = JSON.parse(message);
      console.log("Broadcasting notification:", data);
      io.emit("notification", data);
    } catch (err) {
      console.error("Failed to parse notification message:", err);
    }
  }
});

subscriber.subscribe("notifications", (err) => {
  if (err) {
    console.error("Failed to subscribe to notifications channel:", err);
  } else {
    console.log("✓ Successfully subscribed to Redis notifications channel");
  }
});

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
process.on("SIGINT", () => {
  console.log("Shutting down Socket.io server...");
  subscriber.unsubscribe();
  subscriber.quit();
  httpServer.close(() => {
    console.log("Socket.io server closed");
    process.exit(0);
  });
});
