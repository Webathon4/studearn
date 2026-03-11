import { useState, useCallback } from "react";
import api from "../services/api.js";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get("/api/notifications");
      setNotifications(res.data);
      const unread = res.data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
      return res.data;
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      return [];
    }
  }, []);

  const getUnreadCount = useCallback(async () => {
    try {
      const res = await api.get("/api/notifications/unread-count");
      setUnreadCount(res.data.unreadCount);
      return res.data.unreadCount;
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
      return 0;
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.put("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      const wasUnread = notifications.find((n) => n._id === notificationId)?.isRead === false;
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  }, [notifications]);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  };
};
