import express from "express";
import {
  createPost,
  getPosts,
  applyToPost,
  acceptApplicant,
  getChat,
  sendMessage,
} from "../controllers/learnHubController.js";
import protect from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = express.Router();

// Post endpoints
router.post("/", protect, requireRole(["student"]), createPost);
router.get("/", protect, getPosts);
router.put("/:id/apply", protect, requireRole(["student"]), applyToPost);
router.put("/:id/accept/:userId", protect, requireRole(["student"]), acceptApplicant);

// Chat endpoints
router.get("/:postId/chat", protect, getChat);
router.post("/:postId/chat/message", protect, sendMessage);

export default router;
