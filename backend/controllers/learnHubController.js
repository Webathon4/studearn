import LearnPost from "../models/LearnPost.js";
import LearnHubChat from "../models/LearnHubChat.js";
import { createNotification } from "./notificationController.js";

export const createPost = async (req, res) => {
  try {
    const { title, description, category, type, price } = req.body;

    if (!title || !description || !category || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["learn_request", "teach_offer"].includes(type)) {
      return res.status(400).json({ message: "Invalid type" });
    }

    // Price required for teach_offer
    if (type === "teach_offer" && (!price || price <= 0)) {
      return res.status(400).json({ message: "Price required for teach offers" });
    }

    const post = await LearnPost.create({
      title,
      description,
      category,
      type,
      price: type === "teach_offer" ? price : null,
      createdBy: req.user._id,
    });

    return res.status(201).json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create post" });
  }
};

export const getPosts = async (req, res) => {
  try {
    const { type, skill } = req.query;

    const filter = {};
    if (type && ["learn_request", "teach_offer"].includes(type)) {
      filter.type = type;
    }
    if (skill) {
      filter.$or = [
        { title: { $regex: skill, $options: "i" } },
        { category: { $regex: skill, $options: "i" } },
      ];
    }

    const posts = await LearnPost.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .populate("applications.userId", "name email")
      .populate("acceptedUserId", "name email");

    return res.json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch posts" });
  }
};

export const applyToPost = async (req, res) => {
  try {
    const { proposedPrice, message } = req.body;

    const post = await LearnPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.status === "closed") {
      return res.status(400).json({ message: "Post is closed" });
    }

    if (String(post.createdBy) === String(req.user._id)) {
      return res.status(400).json({ message: "Cannot apply to own post" });
    }

    // Check for duplicate applications
    if (post.applications.some((app) => String(app.userId) === String(req.user._id))) {
      return res.status(400).json({ message: "Already applied" });
    }

    // proposedPrice required for learn_request posts
    if (post.type === "learn_request" && (!proposedPrice || proposedPrice <= 0)) {
      return res.status(400).json({ message: "Price required to apply to learning requests" });
    }

    const application = {
      userId: req.user._id,
      proposedPrice: post.type === "learn_request" ? proposedPrice : null,
      message: message || "",
      status: "pending",
    };

    post.applications.push(application);
    await post.save();

    const populated = await LearnPost.findById(post._id)
      .populate("createdBy", "name email")
      .populate("applications.userId", "name email")
      .populate("acceptedUserId", "name email");

    return res.json(populated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to apply" });
  }
};

export const acceptApplicant = async (req, res) => {
  try {
    const post = await LearnPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (String(post.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only creator can accept applicants" });
    }

    if (post.status === "closed") {
      return res.status(400).json({ message: "Post already closed" });
    }

    const { userId } = req.params;
    const application = post.applications.find((app) => String(app.userId) === String(userId));

    if (!application) {
      return res.status(400).json({ message: "User has not applied" });
    }

    // Create LearnHubChat
    const chat = await LearnHubChat.create({
      postId: post._id,
      creatorId: post.createdBy,
      acceptedUserId: userId,
      isActive: true,
    });

    // Update post
    post.acceptedUserId = userId;
    post.status = "closed";
    post.chatId = chat._id;
    application.status = "accepted";

    // Auto-reject others
    post.applications.forEach((app) => {
      if (String(app.userId) !== String(userId)) {
        app.status = "rejected";
      }
    });

    await post.save();

    const populated = await LearnPost.findById(post._id)
      .populate("createdBy", "name email")
      .populate("applications.userId", "name email")
      .populate("acceptedUserId", "name email")
      .populate("chatId");

    return res.json(populated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to accept applicant" });
  }
};

// LearnHubChat endpoints
export const getChat = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await LearnPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check access
    if (
      String(req.user._id) !== String(post.createdBy) &&
      String(req.user._id) !== String(post.acceptedUserId)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const chat = await LearnHubChat.findOne({ postId })
      .populate("creatorId", "name email")
      .populate("acceptedUserId", "name email")
      .populate("messages.senderId", "name email");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    return res.json(chat);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch chat" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const post = await LearnPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check access
    if (
      String(req.user._id) !== String(post.createdBy) &&
      String(req.user._id) !== String(post.acceptedUserId)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    let chat = await LearnHubChat.findOne({ postId });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    chat.messages.push({
      senderId: req.user._id,
      text,
      timestamp: Date.now(),
    });

    await chat.save();

    // Create notification for the other participant
    const recipientId = String(chat.creatorId) === String(req.user._id) 
      ? chat.acceptedUserId 
      : chat.creatorId;
    
    const senderName = req.user.name || "Someone";
    await createNotification(
      recipientId,
      "chat",
      `${senderName} sent you a message about "${post.title}"`,
      chat._id,
      "LearnHubChat"
    );

    // Emit socket event for real-time notification
    const io = req.app.get("io");
    io.to(String(recipientId)).emit("newNotification", {
      type: "chat",
      message: `${senderName} sent you a message`,
      relatedId: chat._id,
      createdAt: new Date(),
    });

    const populated = await LearnHubChat.findById(chat._id)
      .populate("creatorId", "name email")
      .populate("acceptedUserId", "name email")
      .populate("messages.senderId", "name email");

    return res.json(populated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to send message" });
  }
};
