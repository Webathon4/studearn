import express from "express";
import { getChat, sendMessage } from "../controllers/chatController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:id", protect, getChat);
router.post("/:id/messages", protect, sendMessage);

export default router;
