import express from "express";
import {
  createAuction,
  getAuctions,
  placeBid,
  endAuction,
} from "../controllers/auctionController.js";
import protect from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, requireRole(["student"]), createAuction);
router.get("/", protect, getAuctions);
router.post("/:id/bid", protect, requireRole(["student"]), placeBid);
router.put("/:id/end", protect, requireRole(["student"]), endAuction);

export default router;
