import Task from "../models/Task.js";
import User from "../models/User.js";
<<<<<<< HEAD
import Application from "../models/Application.js";
import Chat from "../models/Chat.js";
import mongoose from "mongoose";
import { calculateDistance } from "../utils/distanceCalculator.js";

// Helper function to check if user is in exam period
const isExamPeriod = (user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!user.examStartDate || !user.examEndDate) {
    return false;
  }
  
  const startDate = new Date(user.examStartDate);
  const endDate = new Date(user.examEndDate);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  
  return today >= startDate && today <= endDate;
};

export const createTask = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      pay, 
      skillsRequired, 
      category, 
      dueDate, 
      dueTime, 
      location, 
      jobLocation,
      // New coin-based fields
      rewardCoins,
      isCampusTask
    } = req.body;
    
    if (!title || !description || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Pay is required only for non-campus tasks
    if (!isCampusTask && !pay) {
      return res.status(400).json({ message: "Payment is required for regular tasks" });
    }

    // Validate location for Physical Work
    if (category === "Physical Work" && (!location || location.trim() === "")) {
      return res.status(400).json({ message: "Location is required for Physical Work tasks" });
    }

    const taskData = {
      title,
      description,
      pay: isCampusTask ? 0 : pay,
=======

export const createTask = async (req, res) => {
  try {
    const { title, description, pay, skillsRequired } = req.body;
    if (!title || !description || !pay) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const task = await Task.create({
      title,
      description,
      pay,
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
      skillsRequired: Array.isArray(skillsRequired)
        ? skillsRequired
        : String(skillsRequired || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
<<<<<<< HEAD
      category,
      location: category === "Physical Work" ? location : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      dueTime: dueTime || null,
      createdBy: req.user._id,
      // Add coin fields (non-breaking - defaults to 0 and false)
      rewardCoins: rewardCoins || 0,
      isCampusTask: isCampusTask || false,
    };

    // Add jobLocation for Physical Work jobs
    if (category === "Physical Work" && jobLocation) {
      taskData.jobLocation = {
        address: jobLocation.address,
        latitude: jobLocation.latitude,
        longitude: jobLocation.longitude,
      };
    }

    // If campus task with coin reward, lock coins
    if (isCampusTask && rewardCoins && rewardCoins > 0) {
      try {
        // Check wallet balance first
        const Wallet = (await import("../models/Wallet.js")).default;
        let wallet = await Wallet.findOne({ userId: req.user._id });
        
        if (!wallet || wallet.coinBalance < rewardCoins) {
          return res.status(400).json({ 
            message: "Insufficient coins to post this task" 
          });
        }

        // Create task first
        const task = await Task.create(taskData);
        
        // Lock coins
        wallet.coinBalance -= rewardCoins;
        await wallet.save();

        // Record transaction
        const CoinTransaction = (await import("../models/CoinTransaction.js")).default;
        await CoinTransaction.create({
          userId: req.user._id,
          type: "lock",
          amount: rewardCoins,
          referenceTaskId: task._id,
          status: "completed",
          description: `Locked ${rewardCoins} coins for task`,
        });

        return res.status(201).json(task.toObject());
      } catch (coinError) {
        console.error("Coin locking error:", coinError);
        return res.status(400).json({ 
          message: coinError.message || "Failed to lock coins for task" 
        });
      }
    } else {
      // Regular task (no coins involved)
      const task = await Task.create(taskData);
      return res.status(201).json(task.toObject());
    }
  } catch (error) {
    console.error("Task creation error:", error);
    return res.status(500).json({ message: error.message || "Task creation failed" });
=======
      createdBy: req.user._id,
    });

    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ message: "Task creation failed" });
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
  }
};

export const getTasks = async (req, res) => {
  try {
<<<<<<< HEAD
    const { category, location, status } = req.query;
    
    // Build filter object - apply category first for efficiency
    const filter = {};
    
    // For clients: show all tasks they created (regardless of status)
    // For students: show only open tasks (that haven't been accepted yet)
    if (req.user.role === "client") {
      // Clients see ALL their tasks
      filter.createdBy = req.user._id;
    } else {
      // Students see only open tasks
      filter.status = status || "open";
    }
    
    if (category) {
      filter.category = category;
    }
    
    // Add location filter for Physical Work tasks only
    // Use indexed text search for better performance
    if (location && category === "Physical Work") {
      // Match by exact word in location string or partial match
      const locationTerms = location.trim().split(/\s+/);
      filter.location = { 
        $regex: locationTerms.map(term => `\\b${term}`).join(".*"), 
        $options: "i" 
      };
    }
    
    // Use .sort() before .lean() and explicitly select all fields
    // Added limit for better performance on large datasets
    const allTasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Only filter by skills for students
    if (req.user.role === "student") {
      const userSkills = req.user.skills || [];
      const matchedTasks = allTasks.filter((task) => {
        const taskSkills = task.skillsRequired || [];
        return taskSkills.some((skill) => userSkills.includes(skill));
      });

      const taskIds = matchedTasks.map((task) => task._id);
      const applications = await Application.find({
        studentId: req.user._id,
        taskId: { $in: taskIds },
      }).lean();

      const applicationByTask = new Map(
        applications.map((application) => [
          String(application.taskId),
          application,
        ])
      );

      const enrichedTasks = matchedTasks.map((task) => {
        const application = applicationByTask.get(String(task._id));
        const enrichedTask = {
          ...task,
        };

        // Calculate distance for Physical Work jobs
        if (task.category === "Physical Work" && task.jobLocation && application && application.studentLocation) {
          const distance = calculateDistance(
            application.studentLocation.latitude,
            application.studentLocation.longitude,
            task.jobLocation.latitude,
            task.jobLocation.longitude
          );
          enrichedTask.distance = distance;
        }

        if (application) {
          enrichedTask.applicationStatus = application.status;
          enrichedTask.applicationId = application._id;
          enrichedTask.chatId = application.chatId;
        }
        return enrichedTask;
      });

      return res.json({
        hasSkills: userSkills.length > 0,
        userSkills,
        tasks: enrichedTasks,
        matchCount: enrichedTasks.length,
      });
    }

    // For clients, return all tasks (already filtered by category if specified)
    return res.json({
      hasSkills: true,
      tasks: allTasks,
      matchCount: allTasks.length,
    });
=======
    const tasks = await Task.find().sort({ createdAt: -1 });
    return res.json(tasks);
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

export const acceptTask = async (req, res) => {
  try {
<<<<<<< HEAD
    const { studentLocation } = req.body;
    const user = await User.findById(req.user._id);
    
    // Check exam period (calendar-based)
    if (isExamPeriod(user)) {
      return res.status(403).json({
        message: "Exam period active. Task applications are disabled."
      });
    }
    
    // Check exam week mode (availability-based)
    if (user.availability === "exam") {
      return res.status(403).json({
        message: "Exam week mode active. You cannot apply for tasks."
      });
    }
    
    // Check trust score
    if (user.trustScore < 30) {
      return res.status(403).json({
        message: "Your trust score is too low to apply for tasks."
      });
    }

=======
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (task.status !== "open") {
      return res.status(400).json({ message: "Task not open" });
    }

<<<<<<< HEAD
    const existingApplication = await Application.findOne({
      taskId: task._id,
      studentId: req.user._id,
    });
    if (existingApplication) {
      return res.status(400).json({ message: "Application already submitted" });
    }

    const chat = await Chat.create({
      jobId: task._id,
      studentId: req.user._id,
      hostId: task.createdBy,
      isActive: true,
    });

    const applicationData = {
      taskId: task._id,
      studentId: req.user._id,
      hostId: task.createdBy,
      chatId: chat._id,
      status: "pending",
    };

    // Store student location for Physical Work jobs
    if (task.category === "Physical Work" && studentLocation) {
      applicationData.studentLocation = {
        latitude: studentLocation.latitude,
        longitude: studentLocation.longitude,
      };
    }

    const application = await Application.create(applicationData);

    return res.status(201).json(application.toObject());
=======
    task.status = "accepted";
    task.acceptedBy = req.user._id;
    await task.save();

    return res.json(task);
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
  } catch (error) {
    return res.status(500).json({ message: "Failed to accept task" });
  }
};

<<<<<<< HEAD
export const getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;
    console.log("Fetching task with ID:", taskId);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      console.log("Invalid ObjectId format:", taskId);
      return res.status(400).json({ message: "Invalid task ID format" });
    }
    
    const task = await Task.findById(taskId).populate("createdBy", "name email");
    
    if (!task) {
      console.log("Task not found for ID:", taskId);
      return res.status(404).json({ message: "Task not found" });
    }

    console.log("Task found:", task.title);
    return res.json(task.toObject());
  } catch (error) {
    console.error("getTaskById error:", error.message);
    return res.status(500).json({ message: "Failed to fetch task details", error: error.message });
  }
};

export const completeTask = async (req, res) => {
  try {
    const { skipped } = req.body;
    
=======
export const completeTask = async (req, res) => {
  try {
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (task.status !== "accepted") {
      return res.status(400).json({ message: "Task not accepted" });
    }
<<<<<<< HEAD
    // Client (creator) can mark task complete
    if (!task.createdBy || String(task.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const student = await User.findById(task.acceptedBy);

    if (skipped) {
      // Student skipped/didn't do the work
      task.status = "skipped";
      await task.save();

      // Decrease trust score for skipping
      student.trustScore = Math.max(0, student.trustScore - 15);
      await student.save();

      // Release locked coins back to provider if campus task
      if (task.isCampusTask && task.rewardCoins > 0) {
        try {
          const Wallet = (await import("../models/Wallet.js")).default;
          let wallet = await Wallet.findOne({ userId: task.createdBy });
          if (wallet) {
            wallet.coinBalance += task.rewardCoins;
            await wallet.save();

            const CoinTransaction = (await import("../models/CoinTransaction.js")).default;
            await CoinTransaction.create({
              userId: task.createdBy,
              type: "release",
              amount: task.rewardCoins,
              referenceTaskId: task._id,
              status: "completed",
              description: `Released ${task.rewardCoins} coins (task skipped)`,
            });
          }
        } catch (coinError) {
          console.error("Error releasing coins:", coinError);
          // Don't fail the task completion, just log the error
        }
      }

      return res.json({
        ...task.toObject(),
        message: "Task marked as skipped. Student trust score decreased by 15."
      });
    } else {
      // Student completed successfully
      task.status = "completed";
      await task.save();

      // Award earnings and increase trust score
      student.earnings += task.pay;
      student.trustScore += 10;

      // Add to work history
      student.workHistory.push({
        taskId: task._id,
        title: task.title,
        pay: task.pay,
        completedAt: new Date()
      });

      await student.save();

      // Transfer coins to student if campus task
      if (task.isCampusTask && task.rewardCoins > 0) {
        try {
          const Wallet = (await import("../models/Wallet.js")).default;
          const CoinTransaction = (await import("../models/CoinTransaction.js")).default;
          
          // Credit student wallet
          let studentWallet = await Wallet.findOne({ userId: task.acceptedBy });
          if (!studentWallet) {
            studentWallet = await Wallet.create({ userId: task.acceptedBy, coinBalance: 0 });
          }
          studentWallet.coinBalance += task.rewardCoins;
          await studentWallet.save();

          // Record transactions
          await CoinTransaction.create({
            userId: task.createdBy,
            type: "debit",
            amount: task.rewardCoins,
            referenceTaskId: task._id,
            status: "completed",
            description: `Transferred ${task.rewardCoins} coins for task completion`,
          });

          await CoinTransaction.create({
            userId: task.acceptedBy,
            type: "credit",
            amount: task.rewardCoins,
            referenceTaskId: task._id,
            status: "completed",
            description: `Earned ${task.rewardCoins} coins from task completion`,
          });
        } catch (coinError) {
          console.error("Error transferring coins:", coinError);
          // Don't fail the task completion, just log the error
        }
      }

      const message = task.isCampusTask && task.rewardCoins > 0
        ? `Task completed successfully. Student earned ₹${task.pay}, ${task.rewardCoins} coins, and trust score increased by 10.`
        : `Task completed successfully. Student earned ₹${task.pay} and trust score increased by 10.`;

      return res.json({
        ...task.toObject(),
        message
      });
    }
  } catch (error) {
    console.error("Complete task error:", error);
    return res.status(500).json({ message: "Failed to complete task" });
  }
};

export const cancelTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (task.status !== "accepted") {
      return res.status(400).json({ message: "Only accepted tasks can be cancelled" });
    }
    // Only the student who accepted can cancel
    if (String(task.acceptedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to cancel" });
    }

    task.status = "open";
    task.acceptedBy = null;
    await task.save();

    // Decrease trust score for cancellation
    const user = await User.findById(req.user._id);
    user.trustScore = Math.max(0, user.trustScore - 15);
    await user.save();

    // Note: Coins remain locked for the task (they were locked when task was posted, not when accepted)
    // This is intentional - the provider's coins stay locked until task is completed or removed

    const taskObj = task.toObject();
    return res.json(taskObj);
  } catch (error) {
    console.error("Cancel task error:", error);
    return res.status(500).json({ message: "Failed to cancel task" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      pay, 
      skillsRequired, 
      category, 
      location, 
      jobLocation, 
      dueDate, 
      dueTime,
      rewardCoins,
      isCampusTask
    } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Only the creator (client) can update the task
    if (String(task.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to update this task" });
    }

    // Only open tasks can be edited
    if (task.status !== "open") {
      return res.status(400).json({ message: "Only open tasks can be edited" });
    }

    // Update fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (pay) task.pay = pay;
    if (skillsRequired) {
      task.skillsRequired = Array.isArray(skillsRequired)
        ? skillsRequired
        : String(skillsRequired || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }
    if (category) {
      task.category = category;
      // Validate location for Physical Work
      if (category === "Physical Work" && (!location || location.trim() === "")) {
        return res.status(400).json({ message: "Location is required for Physical Work tasks" });
      }
    }
    
    // Update location
    if (category === "Physical Work" && location) {
      task.location = location;
      if (jobLocation) {
        task.jobLocation = {
          address: jobLocation.address,
          latitude: jobLocation.latitude,
          longitude: jobLocation.longitude,
        };
      }
    } else if (category && category !== "Physical Work") {
      task.location = null;
      task.jobLocation = undefined;
    }

    if (dueDate) task.dueDate = new Date(dueDate);
    if (dueTime) task.dueTime = dueTime;

    // Update coin fields (non-breaking - only if provided)
    if (typeof isCampusTask !== 'undefined') task.isCampusTask = isCampusTask;
    if (typeof rewardCoins !== 'undefined') {
      // Note: Changing reward coins after posting requires handling locked coins
      // For simplicity, we'll allow it only if the change is minor or we can adjust the lock
      // In production, you might want to prevent this or implement complex logic
      task.rewardCoins = rewardCoins;
    }

    await task.save();
    const taskObj = task.toObject();
    return res.status(200).json(taskObj);
  } catch (error) {
    console.error("Update task error:", error);
    return res.status(500).json({ message: error.message || "Failed to update task" });
  }
};
=======
    if (!task.acceptedBy || String(task.acceptedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    task.status = "completed";
    await task.save();

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { earnings: task.pay },
    });

    return res.json(task);
  } catch (error) {
    return res.status(500).json({ message: "Failed to complete task" });
  }
};
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
