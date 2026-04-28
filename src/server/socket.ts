import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { redis } from "./redis";
import { hostname } from "os";
const port = Number(process.env.PORT) || 3001;

const httpServer = createServer();



const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
  transports: ["polling", "websocket"],
});
console.log("Socket.io server starting on port", port);

// ✅ Define a safe type
type Notification = {
  type: string;
  title: string;
  user: unknown;
};

// Subscribe to Redis pub/sub channel
const subscriber = redis.duplicate();

subscriber.on("message", (channel: string, message: string) => {
  if (channel === "notifications") {
    try {
      const data = JSON.parse(message) as Notification; // ✅ FIXED

      console.log("Broadcasting notification:", data);
      io.emit("notification", data);
    } catch (err) {
      console.error("Failed to parse notification message:", err);
    }
  }
});

// ✅ FIX: handle promise
void subscriber.subscribe("notifications", (err) => {
  if (err) {
    console.error("Failed to subscribe:", err);
  } else {
    console.log("✓ Subscribed to notifications channel");
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

httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Socket.IO server running on port ${port}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down Socket.io server...");

  void subscriber.unsubscribe(); // ✅ FIX
  void subscriber.quit();        // ✅ FIX

  httpServer.close(() => {
    console.log("Socket.io server closed");
    process.exit(0);
  });
});