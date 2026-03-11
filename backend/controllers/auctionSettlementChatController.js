import AuctionSettlementChat from "../models/AuctionSettlementChat.js";
import { createNotification } from "./notificationController.js";

const ensureParticipant = (chat, userId) => {
  return (
    String(chat.sellerId) === String(userId) ||
    String(chat.winnerId) === String(userId)
  );
};

export const getAuctionChatByAuctionId = async (req, res) => {
  try {
    const chat = await AuctionSettlementChat.findOne({
      auctionId: req.params.auctionId,
    });
    if (!chat) {
      return res.status(404).json({ message: "Settlement chat not found" });
    }
    if (!ensureParticipant(chat, req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    return res.json(chat);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch settlement chat" });
  }
};

export const sendAuctionSettlementMessage = async (req, res) => {
  try {
    const chat = await AuctionSettlementChat.findOne({
      auctionId: req.params.auctionId,
    });
    if (!chat) {
      return res.status(404).json({ message: "Settlement chat not found" });
    }
    if (!ensureParticipant(chat, req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (!chat.isActive) {
      return res.status(403).json({
        message: "Chat is closed. Settlement completed.",
      });
    }

    const text = String(req.body.text || "").trim();
    if (!text) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    chat.messages.push({ senderId: req.user._id, text });
    await chat.save();

    // Create notification for the other participant
    const recipientId = String(chat.sellerId) === String(req.user._id) 
      ? chat.winnerId 
      : chat.sellerId;
    
    const senderName = req.user.name || "Someone";
    await createNotification(
      recipientId,
      "auction_message",
      `${senderName} sent you an auction settlement message`,
      chat.auctionId,
      "Auction"
    );

    // Emit socket event for real-time notification
    const io = req.app.get("io");
    io.to(String(recipientId)).emit("newNotification", {
      type: "auction_message",
      message: `${senderName} sent you a message`,
      relatedId: chat.auctionId,
      createdAt: new Date(),
    });

    return res.json(chat);
  } catch (error) {
    return res.status(500).json({ message: "Failed to send message" });
  }
};
