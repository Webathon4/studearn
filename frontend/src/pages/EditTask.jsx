import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Save, XCircle, CheckCircle } from "lucide-react";
import api from "../services/api.js";

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [task, setTask] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    pay: "",
    skillsRequired: "",
    category: "Academic",
    location: "",
    dueDate: "",
    dueTime: "",
  });
  const [jobLocation, setJobLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTask = async () => {
      try {
        const userRes = await api.get("/api/auth/me");
        setUser(userRes.data);

        if (userRes.data.role !== "client") {
          navigate("/dashboard");
          return;
        }

        try {
          const taskRes = await api.get(`/api/tasks/${id}`);
          const taskData = taskRes.data;
          setTask(taskData);

          // Check if user is the creator
          const creatorId = typeof taskData.createdBy === "object" && taskData.createdBy
            ? taskData.createdBy._id
            : taskData.createdBy;
          if (String(creatorId) !== String(userRes.data._id)) {
            setError("You are not authorized to edit this task.");
            navigate("/client-dashboard");
            return;
          }

          // Only allow editing if task is still open
          if (taskData.status !== "open") {
            setError("Only open tasks can be edited. This task is no longer open for editing.");
          }

          // Populate form
          setForm({
            title: taskData.title || "",
            description: taskData.description || "",
            pay: taskData.pay || "",
            skillsRequired: (taskData.skillsRequired || []).join(", "),
            category: taskData.category || "Academic",
            location: taskData.location || "",
            dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString().split("T")[0] : "",
            dueTime: taskData.dueTime || "",
          });

          if (taskData.jobLocation) {
            setJobLocation({
              address: taskData.jobLocation.address,
              latitude: taskData.jobLocation.latitude,
              longitude: taskData.jobLocation.longitude,
            });
          }
        } catch (taskErr) {
          console.error("Task fetch error:", taskErr);
          const errorMsg = taskErr.response?.data?.message || "Failed to load task";
          setError(errorMsg);
        }
      } catch (err) {
        console.error("Auth/load error:", err);
        setError(err.response?.data?.message || "Failed to load user data");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [id, navigate]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const getJobCoordinates = async () => {
    if (!form.location) {
      setError("Please enter a location first");
      return;
    }

    setLocationLoading(true);
    setError("");
    setMessage("");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.location)}&limit=1`,
        {
          signal: controller.signal,
          headers: { "User-Agent": "StudEarn-App" },
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();

      if (data.length > 0) {
        const result = data[0];
        const fullAddress = result.display_name;

        setForm((prev) => ({
          ...prev,
          location: fullAddress,
        }));

        setJobLocation({
          address: fullAddress,
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
        });

        setMessage(`✓ Location found: ${fullAddress.substring(0, 60)}...`);
      } else {
        setError(`No results found for "${form.location}". Try entering a city or street address.`);
      }
    } catch (err) {
      if (err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError("Failed to find location. Please try again.");
      }
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (form.category === "Physical Work" && !jobLocation) {
      setError("Please get coordinates for the job location");
      return;
    }

    try {
      const payload = {
        title: form.title,
        description: form.description,
        pay: Number(form.pay),
        skillsRequired: form.skillsRequired
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        category: form.category,
        location: form.category === "Physical Work" ? form.location : null,
        jobLocation: form.category === "Physical Work" ? jobLocation : null,
        dueDate: form.dueDate || null,
        dueTime: form.dueTime || null,
      };

      await api.put(`/api/tasks/${id}`, payload);
      setMessage("Task updated successfully!");
      setTimeout(() => navigate("/client-dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
    }
  };

  const handleMarkComplete = async () => {
    setMessage("");
    setError("");
    try {
      await api.put(`/api/tasks/${id}/complete`, { skipped: false });
      setMessage("Task marked as completed! Student has been rewarded.");
      setTimeout(() => {
        setTask({ ...task, status: "completed" });
        // Optionally navigate back
        // navigate("/client-dashboard");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark task as complete");
    }
  };

  const handleMarkSkipped = async () => {
    setMessage("");
    setError("");
    try {
      await api.put(`/api/tasks/${id}/complete`, { skipped: true });
      setMessage("Task marked as skipped. Student trust score has been decreased.");
      setTimeout(() => {
        setTask({ ...task, status: "skipped" });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark task as skipped");
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

  const isStillEditable = task && task.status === "open";

  return (
    <div className="container">
      <button
        type="button"
        onClick={() => navigate("/client-dashboard")}
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
        Back to My Tasks
      </button>

      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div className="page-header">
          <h1 className="page-title">View Task Details</h1>
          {isStillEditable && <p className="page-description">Edit your task information</p>}
          {!isStillEditable && (
            <p className="page-description" style={{ color: "var(--warning)" }}>
              This task is no longer open for editing
            </p>
          )}
        </div>

        {message && <p className="success alert alert-success"><CheckCircle size={18} /> {message}</p>}
        {error && <p className="error alert alert-danger"><XCircle size={18} /> {error}</p>}

        {isStillEditable ? (
          <form onSubmit={handleSubmit} className="card">
            <div className="form-group">
              <label htmlFor="title">Task Title</label>
              <input
                id="title"
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="pay">Payment (₹)</label>
              <input
                id="pay"
                type="number"
                name="pay"
                value={form.pay}
                onChange={handleChange}
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="skills">Required Skills</label>
              <input
                id="skills"
                type="text"
                name="skillsRequired"
                placeholder="e.g., JavaScript, Python, Writing (comma separated)"
                value={form.skillsRequired}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Task Category</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="Academic">Academic</option>
                <option value="Creative">Creative</option>
                <option value="Physical Work">Physical Work</option>
              </select>
            </div>

            {form.category === "Physical Work" && (
              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "center" }}>
                  <input
                    id="location"
                    type="text"
                    name="location"
                    placeholder="e.g., Downtown, Sector 5, Near City Center"
                    value={form.location}
                    onChange={handleChange}
                    required
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={getJobCoordinates}
                    disabled={!form.location || locationLoading}
                    className="btn-secondary"
                    title={locationLoading ? "Searching..." : "Get coordinates"}
                    style={{ minWidth: "36px", width: "36px", height: "36px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                  >
                    {locationLoading ? "..." : <MapPin size={16} />}
                  </button>
                </div>
                {jobLocation && (
                  <p style={{ fontSize: "0.8rem", color: "var(--accent)", marginTop: "0.25rem", fontWeight: "500" }}>
                    ✓ Coordinates set ({jobLocation.latitude.toFixed(4)}°, {jobLocation.longitude.toFixed(4)}°)
                  </p>
                )}
              </div>
            )}

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.5rem", marginTop: "1.5rem" }}>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                📅 Optional: Set a due date and time for the task
              </p>

              <div className="form-group">
                <label htmlFor="dueDate">Due Date</label>
                <input
                  id="dueDate"
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dueTime">Due Time</label>
                <input
                  id="dueTime"
                  type="time"
                  name="dueTime"
                  value={form.dueTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Save size={18} />
              Save Changes
            </button>
          </form>
        ) : (
          <div className="card">
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <h2 style={{ marginTop: 0 }}>Task Status: {task?.status && task.status.charAt(0).toUpperCase() + task.status.slice(1)}</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
                {task?.status === "open" && "This task is open for students to apply."}
                {task?.status === "accepted" && "This task has been accepted by a student and is in progress."}
                {task?.status === "completed" && "This task has been completed."}
                {task?.status === "skipped" && "This task was skipped by the student."}
              </p>

              <div className="task-meta" style={{ marginBottom: "1.5rem" }}>
                <div className="task-meta-item">
                  <span className="task-meta-label">Title</span>
                  <span className="task-meta-value" style={{ textAlign: "right" }}>{task?.title}</span>
                </div>
                <div className="task-meta-item">
                  <span className="task-meta-label">Payment</span>
                  <span className="task-meta-value" style={{ textAlign: "right" }}>₹{task?.pay}</span>
                </div>
              </div>

              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                {task?.description}
              </p>

              {task?.status === "accepted" && (
                <div style={{ marginTop: "2rem", borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                    Has the student completed this task?
                  </p>
                  <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                    <button
                      onClick={handleMarkComplete}
                      style={{
                        background: "var(--success)",
                        color: "white",
                        border: "none",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "1rem",
                        fontWeight: "500",
                      }}
                    >
                      <CheckCircle size={18} />
                      Mark Complete
                    </button>
                    <button
                      onClick={handleMarkSkipped}
                      style={{
                        background: "var(--warning)",
                        color: "white",
                        border: "none",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "1rem",
                        fontWeight: "500",
                      }}
                    >
                      <XCircle size={18} />
                      Mark Skipped
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditTask;
