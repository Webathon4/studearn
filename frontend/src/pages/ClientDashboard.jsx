import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Plus, CircleDot, Clock, CheckCircle, AlertTriangle, DollarSign, MessageSquare, Inbox, User, XCircle, Coins, ShoppingCart, Eye } from "lucide-react";
import api from "../services/api.js";
import useWallet from "../hooks/useWallet.js";
import BuyCoinsModal from "../components/BuyCoinsModal.jsx";
import StudentDetailsModal from "../components/StudentDetailsModal.jsx";
import AcceptConfirmationModal from "../components/AcceptConfirmationModal.jsx";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [applicationsByTask, setApplicationsByTask] = useState({});
  const [isBuyCoinsModalOpen, setIsBuyCoinsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [confirmAcceptId, setConfirmAcceptId] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [selectedApplicationLocation, setSelectedApplicationLocation] = useState(null);
  const { balance: coinBalance } = useWallet();

  const loadData = async () => {
    try {
      const userRes = await api.get("/api/auth/me");
      setUser(userRes.data);

      if (userRes.data.role !== "client") {
        navigate("/dashboard");
      }

      const tasksRes = await api.get("/api/tasks");
      const allTasks = tasksRes.data.tasks || tasksRes.data;
      const clientTasks = allTasks.filter(
        (task) => String(task.createdBy) === String(userRes.data._id)
      );
      setTasks(clientTasks);

      const applicationsRes = await api.get("/api/applications/client");
      const grouped = (applicationsRes.data || []).reduce((acc, application) => {
        const taskId = typeof application.taskId === "string" ? application.taskId : application.taskId?._id;
        if (!taskId) {
          return acc;
        }
        if (!acc[taskId]) {
          acc[taskId] = [];
        }
        acc[taskId].push(application);
        return acc;
      }, {});
      setApplicationsByTask(grouped);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCompleteTask = async (id, skipped = false) => {
    try {
      await api.put(`/api/tasks/${id}/complete`, { skipped });
      setCompletingTaskId(null);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete task");
    }
  };

  const handleAcceptApplication = async (id) => {
    try {
      await api.put(`/api/applications/${id}/accept`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept application");
    }
  };

  const handleAcceptApplicationClick = (applicationId, student, location) => {
    setSelectedStudent(student);
    setSelectedApplicationLocation(location);
    setConfirmAcceptId(applicationId);
  };

  const handleConfirmAcceptance = async () => {
    try {
      setIsAccepting(true);
      await handleAcceptApplication(confirmAcceptId);
      setConfirmAcceptId(null);
      setSelectedStudent(null);
      setSelectedApplicationLocation(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept application");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectApplication = async (id) => {
    try {
      await api.put(`/api/applications/${id}/reject`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject application");
    }
  };

  const getTaskStats = () => {
    const open = tasks.filter((t) => t.status === "open").length;
    const accepted = tasks.filter((t) => t.status === "accepted").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const skipped = tasks.filter((t) => t.status === "skipped").length;
    const totalSpent = tasks.reduce((sum, t) => sum + (t.pay || 0), 0);
    return { open, accepted, completed, skipped, totalSpent };
  };

  const stats = getTaskStats();

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">
          <ClipboardList size={32} />
          Task Management
        </h1>
        <p className="page-description">Manage your posted tasks and track progress</p>
      </div>

      {error && <p className="error alert alert-danger">{error}</p>}

      <div style={{ marginBottom: "2rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => navigate("/post")}
          className="btn-accent"
          style={{ width: "auto", padding: "0.75rem 1.5rem" }}
        >
          <Plus size={18} />
          Create New Task
        </button>
        <button
          type="button"
          onClick={() => setIsBuyCoinsModalOpen(true)}
          className="btn-primary"
          style={{ width: "auto", padding: "0.75rem 1.5rem" }}
        >
          <ShoppingCart size={18} />
          Buy Coins
        </button>
        <div style={{ 
          marginLeft: "auto", 
          padding: "0.75rem 1.5rem", 
          background: "var(--card-bg)", 
          borderRadius: "0.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontWeight: "600"
        }}>
          <Coins size={18} style={{ color: "var(--accent)" }} />
          <span>Coin Balance: <strong style={{ color: "var(--accent)" }}>{coinBalance}</strong></span>
        </div>
      </div>

      <BuyCoinsModal 
        isOpen={isBuyCoinsModalOpen} 
        onClose={() => setIsBuyCoinsModalOpen(false)} 
      />

      <StudentDetailsModal
        isOpen={selectedStudent !== null}
        onClose={() => {
          setSelectedStudent(null);
          setSelectedApplicationLocation(null);
        }}
        student={selectedStudent}
        location={selectedApplicationLocation}
      />

      <AcceptConfirmationModal
        isOpen={confirmAcceptId !== null}
        onConfirm={handleConfirmAcceptance}
        onCancel={() => {
          setConfirmAcceptId(null);
          setSelectedStudent(null);
          setSelectedApplicationLocation(null);
        }}
        studentName={selectedStudent?.name || "Student"}
        isLoading={isAccepting}
      />

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CircleDot size={16} />
            Open Tasks
          </div>
          <div className="stat-value">{stats.open}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Clock size={16} />
            In Progress
          </div>
          <div className="stat-value">{stats.accepted}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle size={16} />
            Completed
          </div>
          <div className="stat-value">{stats.completed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertTriangle size={16} />
            Skipped
          </div>
          <div className="stat-value">{stats.skipped}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <DollarSign size={16} />
            Total Offered
          </div>
          <div className="stat-value">₹{stats.totalSpent}</div>
        </div>
      </div>

      <div className="section-title">Your Posted Tasks</div>

      {tasks.length === 0 ? (
        <div className="card">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <Inbox size={48} style={{ color: "var(--text-tertiary)", marginBottom: "1rem" }} />
            <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)" }}>
              No tasks posted yet. Create one to get started!
            </p>
            <button
              type="button"
              onClick={() => navigate("/post")}
              className="btn-accent"
              style={{ marginTop: "1rem", maxWidth: "200px" }}
            >
              Post First Task
            </button>
          </div>
        </div>
      ) : (
        <div className="grid">
          {tasks.map((task) => (
            <div 
              key={task._id} 
              className="task-card"
              onClick={() => navigate(`/tasks/${task._id}/edit`)}
              style={{ cursor: "pointer", position: "relative" }}
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
                  pointerEvents: "none",
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
              <p className="task-description">{task.description}</p>

              <div className="task-meta">
                <div className="task-meta-item">
                  <span className="task-meta-label">Payment</span>
                  <span className="task-meta-value">₹{task.pay}</span>
                </div>
                <div className="task-meta-item">
                  <span className="task-meta-label">Status</span>
                  <span className={`status-badge status-${task.status || "open"}`}>
                    {task.status === "open" && "Open"}
                    {task.status === "accepted" && "In Progress"}
                    {task.status === "completed" && "Completed"}
                    {task.status === "skipped" && "Skipped"}
                  </span>
                </div>
              </div>

              {task.acceptedBy && (
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <User size={16} />
                  Assigned to: {typeof task.acceptedBy === "string" ? task.acceptedBy.slice(0, 8) + "..." : task.acceptedBy}
                </p>
              )}

              {(applicationsByTask[task._id] || []).length > 0 && (
                <div style={{ marginBottom: "1rem" }}>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                    Applicants
                  </p>
                  {(applicationsByTask[task._id] || []).map((application) => (
                    <div key={application._id} style={{ marginBottom: "0.75rem" }}>
                      <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <User size={16} />
                        {application.studentId?.name || "Student"} • {application.status}
                      </p>
                      <div className="task-actions">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedStudent(application.studentId);
                            setSelectedApplicationLocation(application.studentLocation);
                          }}
                          className="btn-secondary"
                          disabled={!application.studentId}
                          style={
                            !application.studentId
                              ? { opacity: 0.6, cursor: "not-allowed" }
                              : undefined
                          }
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                        <button
                          type="button"
                          className="btn-accent"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleAcceptApplicationClick(
                              application._id,
                              application.studentId,
                              application.studentLocation
                            );
                          }}
                          disabled={application.status !== "pending" || task.status !== "open"}
                          style={
                            application.status !== "pending" || task.status !== "open"
                              ? { opacity: 0.6, cursor: "not-allowed" }
                              : undefined
                          }
                        >
                          <CheckCircle size={16} />
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleRejectApplication(application._id);
                          }}
                          disabled={application.status !== "pending"}
                          style={application.status !== "pending" ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                        {application.chatId && (
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={(event) => {
                              event.stopPropagation();
                              const chatId = typeof application.chatId === "string"
                                ? application.chatId
                                : application.chatId?._id;
                              if (chatId) {
                                navigate(`/chat/${chatId}`);
                              }
                            }}
                          >
                            <MessageSquare size={16} />
                            Chat
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {task.status === "accepted" && (
                <div>
                  {completingTaskId === task._id ? (
                    <div className="task-actions" style={{ gap: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleCompleteTask(task._id, false);
                        }}
                        className="btn-accent"
                        style={{ flex: 1, fontSize: "0.9rem", padding: "0.6rem" }}
                      >
                        <CheckCircle size={16} />
                        Task Completed Successfully
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleCompleteTask(task._id, true);
                        }}
                        style={{ 
                          flex: 1, 
                          fontSize: "0.9rem", 
                          padding: "0.6rem",
                          background: "#ef4444",
                          color: "#fff",
                          border: "none",
                          borderRadius: "0.5rem",
                          cursor: "pointer",
                          fontWeight: "600",
                          transition: "all 0.3s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem"
                        }}
                        onMouseEnter={(e) => e.target.style.background = "#dc2626"}
                        onMouseLeave={(e) => e.target.style.background = "#ef4444"}
                      >
                        <XCircle size={16} />
                        Student Skipped Work
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setCompletingTaskId(null);
                        }}
                        style={{
                          flex: 1,
                          fontSize: "0.9rem",
                          padding: "0.6rem",
                          background: "var(--secondary)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border)",
                          borderRadius: "0.5rem",
                          cursor: "pointer",
                          fontWeight: "600",
                          transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => e.target.style.background = "var(--secondary-dark)"}
                        onMouseLeave={(e) => e.target.style.background = "var(--secondary)"}
                      >
                        ⏹️ Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="task-actions">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setCompletingTaskId(task._id);
                        }}
                        className="btn-accent"
                      >
                        <CheckCircle size={16} />
                        Mark Complete
                      </button>
                    </div>
                  )}
                </div>
              )}
              {task.status === "open" && (applicationsByTask[task._id] || []).length === 0 && (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Clock size={16} />
                  Waiting for students to apply...
                </p>
              )}
              {task.status === "completed" && (
                <p style={{ color: "var(--success)", fontSize: "0.9rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <CheckCircle size={16} />
                  Task completed successfully! Student earned ₹{task.pay}
                </p>
              )}
              {task.status === "skipped" && (
                <p style={{ color: "#ef4444", fontSize: "0.9rem", fontWeight: "600" }}>
                  ⚠️ Student skipped this task. Trust score decreased.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
