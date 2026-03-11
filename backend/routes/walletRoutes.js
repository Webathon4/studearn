import express from "express";
import {
  purchaseCoins,
  getWalletBalance,
  getTransactionHistory,
} from "../controllers/walletController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// All wallet routes require authentication
router.post("/purchase-coins", protect, purchaseCoins);
router.get("/balance", protect, getWalletBalance);
router.get("/transactions", protect, getTransactionHistory);

export default router;
