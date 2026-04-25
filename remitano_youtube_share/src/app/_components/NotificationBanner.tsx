"use client";

import { useEffect, useState } from "react";
import io, { type Socket } from "socket.io-client";

type Notification = {
  type: string;
  title: string;
  user: {
    name?: string;
    email?: string;
  };
};

export default function NotificationBanner() {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Get the socket server URL
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

    // Initialize Socket.io connection
    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("✓ Connected to notification server");
    });

    newSocket.on("notification", (data: Notification) => {
      console.log("✓ Received notification:", data);

      if (data.type === "NEW_VIDEO") {
        setNotification(data);

        // auto hide after 4s
        setTimeout(() => {
          setNotification(null);
        }, 4000);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("✗ Disconnected from notification server");
    });

    newSocket.on("connect_error", (error) => {
      console.error("✗ Connection error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  if (!notification) return null;

  const userName =
    notification.user?.name || notification.user?.email || "Unknown";

  return (
    <div className="animate-in fade-in slide-in-from-top fixed top-4 left-4 z-50 w-80 rounded-xl border border-white/10 bg-black/90 p-4 text-white shadow-lg">
      <p className="text-sm text-gray-300">New Video Shared 🎥</p>

      <p className="mt-1 font-bold">{notification.title}</p>

      <p className="text-xs text-gray-400">by {userName}</p>
    </div>
  );
}
