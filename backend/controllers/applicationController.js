import Application from "../models/Application.js";
import Chat from "../models/Chat.js";
import Task from "../models/Task.js";
import { createNotification } from "./notificationController.js";

export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .populate("taskId", "title pay status createdBy")
      .populate("chatId", "isActive");

    return res.json(applications);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch applications" });
  }
};

export const getClientApplications = async (req, res) => {
  try {
    const applications = await Application.find({ hostId: req.user._id })
      .populate("taskId", "title pay status createdBy")
      .populate("studentId", "name email profilePhoto trustScore rating cancellationCount availability workHistory")
      .populate("chatId", "isActive");

    return res.json(applications);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch applications" });
  }
};

export const acceptApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    if (String(application.hostId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (application.status !== "pending") {
      return res.status(400).json({ message: "Application already processed" });
    }

    const task = await Task.findById(application.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (task.status !== "open") {
      return res.status(400).json({ message: "Task not open" });
    }

    application.status = "accepted";
    await application.save();

    task.status = "accepted";
    task.acceptedBy = application.studentId;
    await task.save();

    // Create notification for student
    const clientName = req.user.name || "Client";
    await createNotification(
      application.studentId,
      "job_accepted",
      `${clientName} accepted your application for "${task.title}"`,
      task._id,
      "Task"
    );

    // Emit socket event for real-time notification
    const io = req.app.get("io");
    io.to(String(application.studentId)).emit("newNotification", {
      type: "job_accepted",
      message: `${clientName} accepted your application for "${task.title}"`,
      relatedId: task._id,
      createdAt: new Date(),
    });

    return res.json({ application, task });
  } catch (error) {
    return res.status(500).json({ message: "Failed to accept application" });
  }
};

export const rejectApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    if (String(application.hostId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    application.status = "rejected";
    await application.save();

    const chat = await Chat.findById(application.chatId);
    if (chat) {
      chat.isActive = false;
      await chat.save();
    }

    return res.json({ application });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reject application" });
  }
};
