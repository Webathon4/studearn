import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, DollarSign, CheckCircle, MessageSquare, Coins } from "lucide-react";
import api from "../services/api.js";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userRes = await api.get("/api/auth/me");
        setUser(userRes.data);

        const taskRes = await api.get(`/api/tasks/${id}`);
        setTask(taskRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleApply = async () => {
    if (task.category === "Physical Work") {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported. Please enable location services.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await api.put(`/api/tasks/${id}/accept`, {
              studentLocation: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              },
            });
            navigate("/tasks");
          } catch (err) {
            setError(err.response?.data?.message || "Failed to apply");
          }
        },
        () => {
          setError("Location access denied. Applying without location.");
          api
            .put(`/api/tasks/${id}/accept`, {})
            .then(() => navigate("/tasks"))
            .catch((err) => setError(err.response?.data?.message || "Failed to apply"));
        }
      );
    } else {
      try {
        await api.put(`/api/tasks/${id}/accept`, {});
        navigate("/tasks");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to apply");
      }
    }
  };

  if (loading) {
    return (
      <div className="container">
        <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2rem" }}>
          Loading...
        </p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container">
        <p className="error alert alert-danger">Job not found</p>
      </div>
    );
  }

  return (
    <div className="container">
      <button
        type="button"
        onClick={() => navigate("/tasks")}
        style={{
          background: "none",
          border: "none",
          color: "var(--accent)",
          cursor: "pointer",
          padding: "0.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          fontSize: "1rem",
          fontWeight: "500",
        }}
      >
        <ArrowLeft size={20} />
        Back to Jobs
      </button>

      <div className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <h1 style={{ flex: 1, margin: 0 }}>{task.title}</h1>
          {task.category && (
            <span
              style={{
                display: "inline-block",
                backgroundColor:
                  task.category === "Academic"
                    ? "#3b82f6"
                    : task.category === "Creative"
                      ? "#8b5cf6"
                      : "#f59e0b",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "20px",
                fontSize: "0.85rem",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                whiteSpace: "nowrap",
              }}
            >
              {task.category}
            </span>
          )}
        </div>

        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
          {task.description}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "1rem",
            marginBottom: "1.5rem",
            paddingBottom: "1.5rem",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
              Payment
            </p>
            <p style={{ fontSize: "1.25rem", fontWeight: "600", margin: 0 }}>₹{task.pay}</p>
          </div>

          {task.isCampusTask && task.rewardCoins > 0 && (
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Coins size={14} />
                Coin Reward
              </p>
              <p style={{ fontSize: "1.25rem", fontWeight: "600", margin: 0, color: "var(--accent)" }}>
                {task.rewardCoins} coins
              </p>
            </div>
          )}

          <div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
              Status
            </p>
            <p
              style={{
                fontSize: "0.95rem",
                fontWeight: "600",
                margin: 0,
                color: task.status === "open" ? "var(--accent)" : "var(--text-secondary)",
              }}
            >
              {task.status && task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </p>
          </div>

          {task.dueDate && (
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                Due Date
              </p>
              <p style={{ fontSize: "0.95rem", fontWeight: "500", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Calendar size={16} />
                {new Date(task.dueDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {(task.skillsRequired || []).length > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Required Skills
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {task.skillsRequired.map((skill) => (
                <span
                  key={skill}
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    padding: "0.4rem 0.8rem",
                    borderRadius: "12px",
                    fontSize: "0.85rem",
                    fontWeight: "500",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {error && <p className="error alert alert-danger" style={{ marginBottom: "1rem" }}>{error}</p>}

        {task.status === "open" && (
          <button type="button" onClick={handleApply} className="btn-accent" style={{ width: "100%" }}>
            Apply for Job
          </button>
        )}
      </div>

      {task.category === "Physical Work" && task.jobLocation && (
        <div className="card">
          <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>
            <MapPin size={24} style={{ display: "inline-block", marginRight: "0.5rem", verticalAlign: "middle" }} />
            Job Location
          </h2>

          <p style={{ marginBottom: "1rem", color: "var(--text-secondary)" }}>
            <strong>Address:</strong> {task.location}
          </p>

          <div style={{ marginBottom: "1.5rem", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
            <iframe
              title="Job Location Map"
              width="100%"
              height="300"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.google.com/maps?q=${task.jobLocation.latitude},${task.jobLocation.longitude}&z=15&output=embed`}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            📍 Coordinates: {task.jobLocation.latitude.toFixed(4)}°, {task.jobLocation.longitude.toFixed(4)}°
          </p>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
