import { useEffect, useState } from "react";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import { Target, BookOpen, AlertCircle, Frown, Filter, MapPin, Calendar, MessageSquare, CheckCircle, Clock, Coins } from "lucide-react";
import api from "../services/api.js";

const TaskFeed = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [hasSkills, setHasSkills] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterTime, setFilterTime] = useState("");
  const [locationFilterTimeout, setLocationFilterTimeout] = useState(null);

  const loadData = async (category = "", location = "") => {
    try {
      const userRes = await api.get("/api/auth/me");
      setUser(userRes.data);

      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (location && category === "Physical Work") params.append("location", location);
      
      const url = `/api/tasks${params.toString() ? "?" + params.toString() : ""}`;
      const tasksRes = await api.get(url);
      console.log("Tasks API Response:", tasksRes.data);
      setTasks(tasksRes.data.tasks || []);
      setHasSkills(tasksRes.data.hasSkills ?? true);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
      console.error("Load tasks error:", err);
=======
import api from "../services/api.js";

const TaskFeed = () => {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [tasksRes, userRes] = await Promise.all([
        api.get("/api/tasks"),
        api.get("/api/auth/me"),
      ]);
      setUser(userRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
    }
  };

  useEffect(() => {
    loadData();
  }, []);

<<<<<<< HEAD
  const handleApply = async (id) => {
    const task = tasks.find(t => t._id === id);
    if (!task) {
      setError("Task not found");
      return;
    }

    // Get geolocation for Physical Work jobs
    if (task.category === "Physical Work") {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        return;
      }

      // Show info that we're requesting location
      setError("Requesting your location...");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await api.put(`/api/tasks/${id}/accept`, {
              studentLocation: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              },
            });
            setError("");
            // Reload with current filters
            loadData(filterCategory, filterLocation);
          } catch (err) {
            setError(err.response?.data?.message || "Failed to apply for task");
          }
        },
        (error) => {
          // Fallback: allow apply without geolocation
          console.warn("Geolocation error:", error.code, error.message);
          
          let errorMsg = "Location access denied. ";
          if (error.code === 1) {
            errorMsg += "Applying without location data.";
          } else if (error.code === 2) {
            errorMsg += "Position unavailable. Applying without location.";
          } else if (error.code === 3) {
            errorMsg += "Request timed out. Applying without location.";
          }
          
          setError(errorMsg);
          
          // Apply without location
          api
            .put(`/api/tasks/${id}/accept`, {})
            .then(() => {
              setError("Application submitted!");
              setTimeout(() => loadData(filterCategory, filterLocation), 1500);
            })
            .catch((err) => {
              setError(err.response?.data?.message || "Failed to apply for task");
            });
        },
        {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 0,
        }
      );
    } else {
      // Academic and Creative jobs - direct apply without geolocation
      try {
        await api.put(`/api/tasks/${id}/accept`, {});
        setError("Application submitted!");
        setTimeout(() => loadData(filterCategory, filterLocation), 1500);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to apply for task");
      }
=======
  const handleAccept = async (id) => {
    try {
      await api.put(`/api/tasks/${id}/accept`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept task");
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/api/tasks/${id}/complete`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete task");
    }
  };

<<<<<<< HEAD
  const formatDate = (date) => {
    if (!date) return "No due date";
    return new Date(date).toLocaleDateString();
  };

  // Apply client-side date/time filters only
  // Location filtering is already done on the backend
  // Tasks remain visible until client marks them as completed/skipped
  let filteredTasks = tasks;

  if (filterDate) {
    filteredTasks = filteredTasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split("T")[0];
      return taskDate === filterDate;
    });
  }

  if (filterTime) {
    filteredTasks = filteredTasks.filter((task) => {
      if (!task.dueTime) return false;
      return task.dueTime === filterTime;
    });
  }

  const examWeek = user?.availability === "exam week";
 const visibleTasks = examWeek
    ? filteredTasks.filter((task) => task.pay <= 500)
    : filteredTasks;

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">
          <Target size={32} />
          Available Tasks
        </h1>
        <p className="page-description">Find and accept tasks that match your skills</p>
      </div>

      {examWeek && (
        <p className="warning alert alert-warning">
          <BookOpen size={18} />
          Exam week mode: Showing lighter tasks only (pay up to ₹500)
        </p>
      )}
      {error && <p className="error alert alert-danger">{error}</p>}

      {!hasSkills && (
        <p className="warning alert alert-warning">
          <AlertCircle size={18} />
          Add skills to your profile to see matching tasks.{" "}
          <button
            type="button"
            onClick={() => navigate("/profile")}
            style={{
              background: "none",
              color: "inherit",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textDecoration: "underline",
              fontWeight: "600",
            }}
          >
            Go to Profile
          </button>
        </p>
      )}

      {hasSkills && visibleTasks.length === 0 && (
        <p className="warning alert alert-warning">
          <Frown size={18} />
          No tasks match your skills yet. Check back soon!
        </p>
      )}

      <div className="filter-section">
        <h3>
          <Filter size={20} style={{ verticalAlign: "middle", marginRight: "0.5rem" }} />
          Filter by Category
        </h3>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <button
            type="button"
            className={filterCategory === "" ? "btn-primary" : "btn-secondary"}
            onClick={() => {
              setFilterCategory("");
              setFilterLocation("");
              loadData("");
            }}
            style={{ minWidth: "auto" }}
          >
            All
          </button>
          <button
            type="button"
            className={filterCategory === "Academic" ? "btn-primary" : "btn-secondary"}
            onClick={() => {
              setFilterCategory("Academic");
              setFilterLocation("");
              loadData("Academic");
            }}
            style={{ minWidth: "auto" }}
          >
            Academic
          </button>
          <button
            type="button"
            className={filterCategory === "Creative" ? "btn-primary" : "btn-secondary"}
            onClick={() => {
              setFilterCategory("Creative");
              setFilterLocation("");
              loadData("Creative");
            }}
            style={{ minWidth: "auto" }}
          >
            Creative
          </button>
          <button
            type="button"
            className={filterCategory === "Physical Work" ? "btn-primary" : "btn-secondary"}
            onClick={() => {
              setFilterCategory("Physical Work");
              setFilterLocation("");
              loadData("Physical Work");
            }}
            style={{ minWidth: "auto" }}
          >
            Physical Work
          </button>
        </div>
      </div>

      <div className="filter-section">
        <h3>
          <Calendar size={20} style={{ verticalAlign: "middle", marginRight: "0.5rem" }} />
          Filter by Date & Time
        </h3>
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="dateFilter">Due Date</label>
            <input
              id="dateFilter"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="timeFilter">Due Time</label>
            <input
              id="timeFilter"
              type="time"
              value={filterTime}
              onChange={(e) => setFilterTime(e.target.value)}
            />
          </div>
          {filterCategory === "Physical Work" && (
            <div className="filter-group">
              <label htmlFor="locationFilter">Location</label>
              <input
                id="locationFilter"
                type="text"
                placeholder="e.g., Downtown, Sector 5"
                value={filterLocation}
                onChange={(e) => {
                  const newLocation = e.target.value;
                  setFilterLocation(newLocation);
                  
                  // Debounce the API call to 800ms for location search efficiency
                  if (locationFilterTimeout) {
                    clearTimeout(locationFilterTimeout);
                  }
                  
                  const timeoutId = setTimeout(() => {
                    if (newLocation.trim()) {
                      loadData(filterCategory, newLocation);
                    } else {
                      // If location is cleared, reload with just category
                      loadData(filterCategory, "");
                    }
                  }, 800); // Longer debounce for location API calls
                  
                  setLocationFilterTimeout(timeoutId);
                }}
              />
            </div>
          )}
          {(filterDate || filterTime) && (
            <div className="filter-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setFilterDate("");
                  setFilterTime("");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
        {visibleTasks.length > 0 && (
          <p style={{ marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MapPin size={16} />
            {visibleTasks.length} task{visibleTasks.length !== 1 ? "s" : ""} matching your criteria
          </p>
        )}
      </div>

      <div className="grid">
        {visibleTasks.map((task) => (
          <div
            key={task._id}
            className="task-card"
            style={{ cursor: "pointer", position: "relative" }}
            onClick={() => navigate(`/tasks/${task._id}`)}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: "inherit",
                backgroundColor: "rgba(0, 0, 0, 0.03)",
                opacity: 0,
                transition: "opacity 0.2s",
              }}
              className="card-hover"
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
            ></div>

            <h3
              className="task-title"
              style={{
                cursor: "pointer",
                color: "var(--accent)",
                position: "relative",
              }}
            >
              {task.title}
            </h3>
            {task.category && (
              <span style={{
                display: "inline-block",
                backgroundColor: task.category === "Academic" ? "#3b82f6" : task.category === "Creative" ? "#8b5cf6" : "#f59e0b",
                color: "white",
                padding: "0.25rem 0.75rem",
                borderRadius: "20px",
                fontSize: "0.75rem",
                fontWeight: "600",
                marginBottom: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                {task.category}
              </span>
            )}
            <p className="task-description">{task.description}</p>

            <div className="task-meta">
              <div className="task-meta-item">
                <span className="task-meta-label">Pay</span>
                <span className="task-meta-value">₹{task.pay}</span>
              </div>
              {task.isCampusTask && task.rewardCoins > 0 && (
                <div className="task-meta-item">
                  <span className="task-meta-label">
                    <Coins size={14} style={{ verticalAlign: "middle" }} /> Reward
                  </span>
                  <span className="task-meta-value" style={{ color: "var(--accent)" }}>
                    {task.rewardCoins} coins
                  </span>
                </div>
              )}
              <div className="task-meta-item">
                <span className="task-meta-label">Status</span>
                <span className={`status-badge status-${task.status || "open"}`}>
                  {task.status || "Open"}
                </span>
              </div>
            </div>

            {task.category === "Physical Work" && task.location && (
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <MapPin size={16} />
                {task.location}
              </p>
            )}

            {task.category === "Physical Work" && task.distance !== undefined && (
              <p style={{ fontSize: "0.85rem", color: "var(--accent)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "500" }}>
                📏 {task.distance} km away
              </p>
            )}

            {(task.skillsRequired || []).length > 0 && (
              <div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Skills Required</p>
                <div className="task-skills">
                  {task.skillsRequired.map((skill) => (
                    <span key={skill} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Calendar size={16} />
              {formatDate(task.dueDate)}
              {task.dueTime && ` @ ${task.dueTime}`}
            </p>

            <div className="task-actions">
              {task.status === "open" && !task.applicationStatus && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleApply(task._id);
                  }}
                  className="btn-accent"
                >
                  Apply
                </button>
              )}
              {task.applicationStatus === "pending" && (
                <button type="button" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                  <Clock size={16} />
                  Applied
                </button>
              )}
              {task.applicationStatus === "rejected" && (
                <button type="button" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                  Rejected
                </button>
              )}
              {task.applicationStatus === "accepted" && (
                <button type="button" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                  <CheckCircle size={16} />
                  Assigned
                </button>
              )}
              {task.chatId && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={(event) => {
                    event.stopPropagation();
                    const chatId = typeof task.chatId === "string" ? task.chatId : task.chatId?._id;
                    if (chatId) {
                      navigate(`/chat/${chatId}`);
                    }
                  }}
                >
                  <MessageSquare size={16} />
                  Chat
                </button>
              )}
              {task.status === "accepted" &&
                String(task.acceptedBy) === String(user?._id) && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleComplete(task._id);
                    }}
                  >
                    <CheckCircle size={16} />
                    Mark Completed
                  </button>
                )}
              {task.status === "accepted" &&
                String(task.acceptedBy) !== String(user?._id) && (
                  <button type="button" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                    Already Accepted
                  </button>
                )}
              {task.status === "completed" && (
                <button type="button" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                  <CheckCircle size={16} />
                  Completed
                </button>
              )}
            </div>
=======
  const examWeek = user?.availability === "exam week";
  const visibleTasks = examWeek
    ? tasks.filter((task) => task.pay <= 500)
    : tasks;

  return (
    <div>
      <h2>Task Feed</h2>
      {examWeek && (
        <p className="warning">
          Exam week: showing only lighter tasks (pay up to 500).
        </p>
      )}
      {error && <p className="error">{error}</p>}
      <div className="grid">
        {visibleTasks.map((task) => (
          <div key={task._id} className="card">
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>
              Pay: <strong>{task.pay}</strong>
            </p>
            <p>Status: {task.status}</p>
            <p>Skills: {(task.skillsRequired || []).join(", ")}</p>
            {task.status === "open" && (
              <button type="button" onClick={() => handleAccept(task._id)}>
                Accept Task
              </button>
            )}
            {task.status === "accepted" && (
              <button type="button" onClick={() => handleComplete(task._id)}>
                Mark Completed
              </button>
            )}
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskFeed;
