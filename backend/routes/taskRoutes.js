import express from "express";
<<<<<<< HEAD
import { createTask, getTasks, getTaskById, updateTask, acceptTask, completeTask, cancelTask } from "../controllers/taskController.js";
import protect from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = express.Router();

// Only clients can create tasks
router.post("/", protect, requireRole(["client"]), createTask);

// All authenticated users can view all tasks (list)
router.get("/", protect, getTasks);

// Specific task action routes BEFORE generic :id routes
router.put("/:id/accept", protect, requireRole(["student"]), acceptTask);
router.put("/:id/cancel", protect, requireRole(["student"]), cancelTask);
router.put("/:id/complete", protect, requireRole(["client"]), completeTask);

// Generic :id routes (after specific ones)
router.get("/:id", protect, getTaskById);
router.put("/:id", protect, requireRole(["client"]), updateTask);
=======
import { createTask, getTasks, acceptTask, completeTask } from "../controllers/taskController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.put("/:id/accept", protect, acceptTask);
router.put("/:id/complete", protect, completeTask);
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768

export default router;
