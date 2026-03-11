import Chat from "../models/Chat.js";
import { createNotification } from "./notificationController.js";

const ensureParticipant = (chat, userId) => {
  return (
    String(chat.studentId) === String(userId) ||
    String(chat.hostId) === String(userId)
  );
};

export const getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    if (!ensureParticipant(chat, req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    return res.json(chat);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch chat" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    if (!ensureParticipant(chat, req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (!chat.isActive) {
      return res.status(403).json({
        message: "Chat disabled. Application rejected.",
      });
    }

    const text = String(req.body.text || "").trim();
    if (!text) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    chat.messages.push({ senderId: req.user._id, text });
    await chat.save();

    // Create notification for the other participant
    const recipientId = String(chat.studentId) === String(req.user._id) 
      ? chat.hostId 
      : chat.studentId;
    
    const senderName = req.user.name || "Someone";
    await createNotification(
      recipientId,
      "chat",
      `${senderName} sent you a message`,
      chat._id,
      "Chat"
    );

    // Emit socket event for real-time notification
    const io = req.app.get("io");
    io.to(String(recipientId)).emit("newNotification", {
      type: "chat",
      message: `${senderName} sent you a message`,
      relatedId: chat._id,
      createdAt: new Date(),
    });

    return res.json(chat);
  } catch (error) {
    return res.status(500).json({ message: "Failed to send message" });
  }
};
