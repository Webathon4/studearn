import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("relatedId");

    return res.json(notifications);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    return res.json({ unreadCount: count });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch unread count" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    ).populate("relatedId");

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.json(notification);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    return res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to mark all notifications as read" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete notification" });
  }
};

// Function to create notifications (called from other controllers)
export const createNotification = async (userId, type, message, relatedId = null, relatedModel = null) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      message,
      relatedId,
      relatedModel,
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};
