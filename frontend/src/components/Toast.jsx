import { useState, useEffect } from "react";
import { X, Bell } from "lucide-react";

const Toast = ({ message, type = "info", onClose, autoClose = 4000 }) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const getBackgroundColor = () => {
    switch (type) {
      case "chat":
      case "job_accepted":
        return "rgba(79, 70, 229, 0.95)";
      case "auction_won":
      case "new_auction":
        return "rgba(16, 185, 129, 0.95)";
      case "auction_message":
        return "rgba(245, 158, 11, 0.95)";
      default:
        return "rgba(100, 116, 139, 0.95)";
    }
  };

  const getIcon = () => {
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
      default:
        return "ℹ️";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        backgroundColor: getBackgroundColor(),
        color: "#fff",
        padding: "1rem 1.5rem",
        borderRadius: "0.75rem",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        maxWidth: "400px",
        zIndex: 9999,
        animation: "slideIn 0.3s ease-out",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      }}
    >
      <span style={{ fontSize: "1.25rem" }}>{getIcon()}</span>
      <span style={{ flex: 1, fontSize: "0.95rem", lineHeight: "1.4" }}>{message}</span>
      <button
        type="button"
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          padding: 0,
          display: "flex",
        }}
      >
        <X size={18} />
      </button>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "info", autoClose = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, autoClose }]);
    return id;
  };

  const closeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    toasts,
    showToast,
    closeToast,
    ToastContainer: () => (
      <div>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => closeToast(toast.id)}
            autoClose={toast.autoClose}
          />
        ))}
      </div>
    ),
  };
};
