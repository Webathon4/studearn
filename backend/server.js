import express from "express";
import cors from "cors";
import dotenv from "dotenv";
<<<<<<< HEAD
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
=======
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
<<<<<<< HEAD
import auctionRoutes from "./routes/auctionRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import auctionSettlementChatRoutes from "./routes/auctionSettlementChatRoutes.js";
import learnHubRoutes from "./routes/learnHubRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
=======
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768

dotenv.config();
connectDB();

const app = express();
<<<<<<< HEAD
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());

// Make io accessible to routes
app.set("io", io);

=======
app.use(cors());
app.use(express.json());

>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Student Pocket Money API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/dashboard", dashboardRoutes);
<<<<<<< HEAD
app.use("/api/auctions", auctionRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/learnhub", learnHubRoutes);
app.use("/api/auction-settlement-chats", auctionSettlementChatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/wallet", walletRoutes);
=======
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Server error",
  });
});

<<<<<<< HEAD
// Socket.io connection handling
const connectedUsers = new Map(); // Map of userId -> socketId

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // User connects/logs in
  socket.on("userConnected", (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.join(userId); // Join room with userId
    console.log(`User ${userId} connected with socket ${socket.id}`);
  });

  // User disconnects
  socket.on("disconnect", () => {
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Make connectedUsers accessible to controllers
app.set("connectedUsers", connectedUsers);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
=======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
  console.log(`Server running on port ${PORT}`);
});
