import mongoose from "mongoose";

const settlementMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const auctionSettlementChatSchema = new mongoose.Schema(
  {
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
      unique: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: { type: Boolean, default: true },
    messages: { type: [settlementMessageSchema], default: [] },
  },
  { timestamps: true }
);

const AuctionSettlementChat = mongoose.model(
  "AuctionSettlementChat",
  auctionSettlementChatSchema
);
export default AuctionSettlementChat;
