import express from "express";
import {
  acceptApplication,
  rejectApplication,
  getMyApplications,
  getClientApplications,
} from "../controllers/applicationController.js";
import protect from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/mine", protect, requireRole(["student"]), getMyApplications);
router.get("/client", protect, requireRole(["client"]), getClientApplications);
router.put("/:id/accept", protect, requireRole(["client"]), acceptApplication);
router.put("/:id/reject", protect, requireRole(["client"]), rejectApplication);

export default router;
