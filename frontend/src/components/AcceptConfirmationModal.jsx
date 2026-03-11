import { AlertCircle } from "lucide-react";

const AcceptConfirmationModal = ({ isOpen, onConfirm, onCancel, studentName, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{
          width: "90%",
          maxWidth: "450px",
          backgroundColor: "var(--card-bg)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
          padding: "2rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#fef3c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertCircle size={32} style={{ color: "#f59e0b" }} />
          </div>
        </div>

        {/* Title */}
        <h2 style={{ margin: "0 0 1rem", textAlign: "center", color: "var(--text-primary)" }}>
          Confirm Acceptance
        </h2>

        {/* Message */}
        <p
          style={{
            textAlign: "center",
            color: "var(--text-secondary)",
            lineHeight: "1.6",
            marginBottom: "1.5rem",
            fontSize: "0.95rem",
          }}
        >
          You are selecting <strong>{studentName}</strong> based on their profile and history.
        </p>

        {/* Details */}
        <div
          style={{
            backgroundColor: "var(--background)",
            padding: "1rem",
            borderRadius: "0.5rem",
            marginBottom: "2rem",
            borderLeft: "4px solid var(--accent)",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
          }}
        >
          <p style={{ margin: 0, lineHeight: "1.6" }}>
            This student will be assigned to your task. You can start communication and finalize details through the chat interface.
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={isLoading}
            style={{
              flex: 1,
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-accent"
            disabled={isLoading}
            style={{
              flex: 1,
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Accepting..." : "Yes, Accept"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcceptConfirmationModal;
