import express from "express";
import { matchTasks } from "../controllers/aiController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/match", protect, matchTasks);

export default router;
