import { X, MapPin, Award, User, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";

const StudentDetailsModal = ({ isOpen, onClose, student, location }) => {
  if (!isOpen || !student) return null;

  // Calculate total jobs completed (from workHistory)
  const totalJobsCompleted = student.workHistory?.length || 0;
  
  // Completion rate (assuming all items in workHistory are completed)
  const completionRate = totalJobsCompleted > 0 ? 100 : 0;

  // Determine reliability badge
  const getReliabilityBadge = (trustScore) => {
    if (trustScore > 80) {
      return { label: "Highly Reliable", color: "#10b981", bgColor: "#d1fae5", textColor: "#065f46" };
    } else if (trustScore >= 50) {
      return { label: "Moderately Reliable", color: "#f59e0b", bgColor: "#fef3c7", textColor: "#92400e" };
    } else {
      return { label: "Low Reliability", color: "#ef4444", bgColor: "#fee2e2", textColor: "#7f1d1d" };
    }
  };

  const reliabilityData = getReliabilityBadge(student.trustScore || 0);

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
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: "90%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          backgroundColor: "var(--card-bg)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
            zIndex: 10,
          }}
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div style={{ padding: "2rem 2rem 1rem", textAlign: "center", borderBottom: "1px solid var(--border)" }}>
          {/* Profile Photo */}
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              margin: "0 auto 1rem",
              backgroundColor: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              border: "3px solid var(--accent)",
            }}
          >
            {student.profilePhoto ? (
              <img
                src={student.profilePhoto}
                alt={student.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <User size={60} style={{ color: "white" }} />
            )}
          </div>

          <h2 style={{ margin: "0 0 0.5rem", color: "var(--text-primary)" }}>{student.name}</h2>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem" }}>{student.email}</p>
        </div>

        {/* Reliability Badge */}
        <div
          style={{
            margin: "1.5rem 2rem 0",
            padding: "1rem",
            backgroundColor: reliabilityData.bgColor,
            borderRadius: "0.5rem",
            textAlign: "center",
            borderLeft: `4px solid ${reliabilityData.color}`,
          }}
        >
          <p style={{ margin: 0, color: reliabilityData.textColor, fontWeight: "600", fontSize: "0.95rem" }}>
            {reliabilityData.label}
          </p>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            padding: "1.5rem 2rem",
          }}
        >
          {/* Trust Score */}
          <div
            style={{
              padding: "1rem",
              backgroundColor: "var(--background)",
              borderRadius: "0.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Award size={18} style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Trust Score</span>
            </div>
            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700", color: "var(--accent)" }}>
              {student.trustScore || 0}
            </p>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
              Out of 100
            </p>
          </div>

          {/* Rating */}
          <div
            style={{
              padding: "1rem",
              backgroundColor: "var(--background)",
              borderRadius: "0.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <TrendingUp size={18} style={{ color: "#f59e0b" }} />
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Rating</span>
            </div>
            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700", color: "#f59e0b" }}>
              {student.rating ? student.rating.toFixed(1) : "5.0"}
            </p>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
              Out of 5
            </p>
          </div>

          {/* Total Jobs Completed */}
          <div
            style={{
              padding: "1rem",
              backgroundColor: "var(--background)",
              borderRadius: "0.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <CheckCircle size={18} style={{ color: "#10b981" }} />
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Jobs Completed</span>
            </div>
            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700", color: "#10b981" }}>
              {totalJobsCompleted}
            </p>
          </div>

          {/* Completion Rate */}
          <div
            style={{
              padding: "1rem",
              backgroundColor: "var(--background)",
              borderRadius: "0.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <CheckCircle size={18} style={{ color: "#3b82f6" }} />
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Completion Rate</span>
            </div>
            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700", color: "#3b82f6" }}>
              {completionRate}%
            </p>
          </div>

          {/* Cancellation Count */}
          <div
            style={{
              padding: "1rem",
              backgroundColor: "var(--background)",
              borderRadius: "0.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <AlertCircle size={18} style={{ color: "#ef4444" }} />
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Cancellations</span>
            </div>
            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700", color: "#ef4444" }}>
              {student.cancellationCount || 0}
            </p>
          </div>

          {/* Academic Availability */}
          <div
            style={{
              padding: "1rem",
              backgroundColor: "var(--background)",
              borderRadius: "0.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
              Availability
            </span>
            <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: "600", color: "var(--accent)" }}>
              {student.availability ? student.availability.charAt(0).toUpperCase() + student.availability.slice(1) : "Normal"}
            </p>
          </div>
        </div>

        {/* Location (if physical job) */}
        {location && (
          <div
            style={{
              padding: "0 2rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--text-secondary)",
            }}
          >
            <MapPin size={18} style={{ color: "var(--accent)" }} />
            <span>
              Location: {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}
            </span>
          </div>
        )}

        {/* Info Text */}
        <div
          style={{
            padding: "1rem 2rem 2rem",
            backgroundColor: "var(--background)",
            borderRadius: "0.5rem",
            margin: "1rem 2rem 0",
            borderLeft: "4px solid var(--accent)",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            <strong>Note:</strong> This student's profile is based on their work history and performance ratings. Trust Score is automatically calculated based on task completion, ratings, and job history.
          </p>
        </div>

        {/* Close Button at Bottom */}
        <div style={{ padding: "0 2rem 2rem", textAlign: "center", borderTop: "1px solid var(--border)", marginTop: "1.5rem" }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary"
            style={{ width: "100%", maxWidth: "200px" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;
