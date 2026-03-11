import express from "express";
<<<<<<< HEAD
import { registerUser, loginUser, getMe, updateMe, updateExamSchedule } from "../controllers/authController.js";
=======
import { registerUser, loginUser, getMe, updateMe } from "../controllers/authController.js";
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
<<<<<<< HEAD
router.put("/exam-schedule", protect, updateExamSchedule);
=======
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768

export default router;
