import express from "express";
import {
  getAuctionChatByAuctionId,
  sendAuctionSettlementMessage,
} from "../controllers/auctionSettlementChatController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:auctionId", protect, getAuctionChatByAuctionId);
router.post("/:auctionId/messages", protect, sendAuctionSettlementMessage);

export default router;
