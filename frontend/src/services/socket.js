import { io } from "socket.io-client";

let socket = null;

export const initSocket = (userId) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      query: { userId },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("Connected to notification server");
      socket.emit("userConnected", userId);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from notification server");
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
