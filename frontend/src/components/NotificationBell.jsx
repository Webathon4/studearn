import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications.js";

const NotificationBell = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotifications();

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      
      // Listen for real-time notification events
      const handleNotificationReceived = () => {
        fetchNotifications();
      };
      
      window.addEventListener("notificationReceived", handleNotificationReceived);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener("notificationReceived", handleNotificationReceived);
      };
    }
  }, [userId, fetchNotifications]);

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  const getIcon = (type) => {
    switch (type) {
      case "chat":
        return "💬";
      case "job_accepted":
        return "✅";
      case "auction_won":
        return "🎉";
      case "auction_message":
        return "💰";
      case "new_auction":
        return "🔔";
      case "new_job":
        return "📋";
      default:
        return "ℹ️";
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return then.toLocaleDateString();
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "none",
          border: "none",
          color: "var(--text-primary)",
          cursor: "pointer",
          padding: "0.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.95rem",
          transition: "all var(--transition-fast)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-primary)";
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              backgroundColor: "var(--danger)",
              color: "white",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: "600",
              minWidth: "20px",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: "0",
            marginTop: "0.5rem",
            backgroundColor: "var(--surface-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "0.75rem",
            boxShadow: "var(--shadow-lg)",
            zIndex: 1000,
            minWidth: "320px",
            maxHeight: "400px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              padding: "1rem",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h4 style={{ margin: 0, fontSize: "1rem" }}>Notifications</h4>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-secondary)",
                padding: 0,
                display: "flex",
              }}
            >
              <X size={16} />
            </button>
          </div>

          {notifications.length === 0 ? (
            <div
              style={{
                padding: "2rem 1rem",
                textAlign: "center",
                color: "var(--text-secondary)",
              }}
            >
              <p style={{ marginBottom: 0 }}>No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleMarkAsRead(notification._id)}
                  style={{
                    padding: "0.75rem 1rem",
                    borderBottom: "1px solid var(--surface-hover)",
                    cursor: "pointer",
                    backgroundColor: notification.isRead
                      ? "transparent"
                      : "var(--surface-hover)",
                    transition: "all var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    if (!notification.isRead) {
                      e.currentTarget.style.backgroundColor = "var(--bg-overlay-1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = notification.isRead
                      ? "transparent"
                      : "var(--surface-hover)";
                  }}
                >
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <span style={{ fontSize: "1.1rem", minWidth: "24px" }}>
                      {getIcon(notification.type)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          marginBottom: "0.25rem",
                          fontSize: "0.9rem",
                          color: "var(--text-primary)",
                          fontWeight: notification.isRead ? "400" : "600",
                          wordWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        {notification.message}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.75rem",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: "var(--accent)",
                          marginTop: "0.5rem",
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
