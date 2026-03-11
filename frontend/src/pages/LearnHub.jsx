import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search, GraduationCap, Lightbulb, Users, CheckCircle, XCircle, MessageCircle } from "lucide-react";
import api from "../services/api.js";

const LearnHub = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [selectedType, setSelectedType] = useState("learn_request");
  const [skillQuery, setSkillQuery] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    type: "learn_request",
    price: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [applyModal, setApplyModal] = useState({ isOpen: false, postId: null, proposedPrice: "", message: "" });

  const loadUser = async () => {
    try {
      const userRes = await api.get("/api/auth/me");
      setUser(userRes.data);
      if (userRes.data.role !== "student") {
        navigate("/dashboard");
      }
    } catch {
      navigate("/login");
    }
  };

  const loadPosts = async (type = "", skill = "") => {
    try {
      const params = new URLSearchParams();
      if (type) {
        // Invert search: if looking for "learn_request", show "teach_offer" and vice versa
        const searchType = type === "learn_request" ? "teach_offer" : "learn_request";
        params.append("type", searchType);
      }
      if (skill) params.append("skill", skill);
      const res = await api.get(`/api/learnhub?${params.toString()}`);
      setPosts(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load posts");
    }
  };

  useEffect(() => {
    loadUser();
    loadPosts("learn_request", "");
  }, []);

  const handleSearch = () => {
    loadPosts(selectedType, skillQuery);
  };

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      const postData = { ...form };
      // Only include price for teach_offer posts
      if (form.type === "learn_request") {
        delete postData.price;
      }
      await api.post("/api/learnhub", postData);
      setForm({ title: "", description: "", category: "", type: "learn_request", price: "" });
      setMessage("Post created successfully");
      loadPosts(selectedType, skillQuery);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post");
    }
  };

  const handleApplyStart = (postId, postType) => {
    if (postType === "learn_request") {
      // Open modal for teachers to enter proposed price
      setApplyModal({ isOpen: true, postId, proposedPrice: "", message: "" });
    } else {
      // For teach_offer posts, apply directly
      handleApplyDirect(postId);
    }
  };

  const handleApplyDirect = async (postId) => {
    setMessage("");
    setError("");
    try {
      await api.put(`/api/learnhub/${postId}/apply`, {});
      setMessage("Applied successfully");
      loadPosts(selectedType, skillQuery);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to apply");
    }
  };

  const handleApplyWithPrice = async () => {
    if (!applyModal.proposedPrice || parseFloat(applyModal.proposedPrice) <= 0) {
      setError("Please enter a valid price");
      return;
    }
    setMessage("");
    setError("");
    try {
      await api.put(`/api/learnhub/${applyModal.postId}/apply`, {
        proposedPrice: applyModal.proposedPrice,
        message: applyModal.message,
      });
      setMessage("Applied successfully with price proposal");
      setApplyModal({ isOpen: false, postId: null, proposedPrice: "", message: "" });
      loadPosts(selectedType, skillQuery);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to apply");
    }
  };

  const handleApply = async (id) => {
    setMessage("");
    setError("");
    try {
      await api.put(`/api/learnhub/${id}/apply`);
      setMessage("Applied successfully");
      loadPosts(selectedType, skillQuery);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to apply");
    }
  };

  const handleAccept = async (postId, userId) => {
    setMessage("");
    setError("");
    try {
      await api.put(`/api/learnhub/${postId}/accept/${userId}`);
      setMessage("Applicant accepted and post closed");
      loadPosts(selectedType, skillQuery);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept applicant");
    }
  };

  if (!user || user.role !== "student") {
    return (
      <div className="container">
        <p className="error alert alert-danger">Only students can access LearnHub.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">
          <BookOpen size={32} />
          LearnHub
        </h1>
        <p className="page-description">
          Share skills and learn from your peers
        </p>
      </div>

      {message && <p className="success alert alert-success"><CheckCircle size={18} /> {message}</p>}
      {error && <p className="error alert alert-danger"><XCircle size={18} /> {error}</p>}

      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginTop: 0, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Search size={20} />
          Search Posts
        </h3>
        <div className="toggle-group" style={{ marginBottom: "1rem" }}>
          <button
            type="button"
            className={`toggle-btn ${selectedType === "learn_request" ? "active" : ""}`}
            onClick={() => setSelectedType("learn_request")}
          >
            I Want to Learn
          </button>
          <button
            type="button"
            className={`toggle-btn ${selectedType === "teach_offer" ? "active" : ""}`}
            onClick={() => setSelectedType("teach_offer")}
          >
            I Want to Teach
          </button>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label htmlFor="skillQuery">Skill or Category</label>
            <input
              id="skillQuery"
              type="text"
              placeholder="e.g., JavaScript, Guitar, Cooking"
              value={skillQuery}
              onChange={(e) => setSkillQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="btn-accent"
            style={{ width: "auto", padding: "0.75rem 1.5rem" }}
          >
            Search
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto 2rem" }}>
        <form onSubmit={handleCreate} className="card">
          <h3 style={{ marginTop: 0 }}>✍️ Create Post</h3>
          <div className="form-group">
            <label htmlFor="type">Post Type</label>
            <select id="type" name="type" value={form.type} onChange={handleChange}>
              <option value="learn_request">I Want to Learn</option>
              <option value="teach_offer">I Want to Teach</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="title">Title</label>
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
            <label htmlFor="category">Category/Skill</label>
            <input
              id="category"
              type="text"
              name="category"
              placeholder="e.g., Programming, Music, Cooking"
              value={form.category}
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
          {form.type === "teach_offer" && (
            <div className="form-group">
              <label htmlFor="price">Price (per session)</label>
              <input
                id="price"
                type="number"
                name="price"
                placeholder="e.g., 500"
                value={form.price}
                onChange={handleChange}
                min="0"
                step="10"
                required
              />
            </div>
          )}
          <button type="submit">Create Post</button>
        </form>
      </div>

      <div className="grid">
        {posts.map((post) => {
          const isCreator = String(post.createdBy?._id) === String(user._id);
          const userApplication = post.applications?.find(
            (app) => String(app.userId?._id || app.userId) === String(user._id)
          );
          const hasApplied = !!userApplication;
          const isAccepted = userApplication?.status === "accepted";

          return (
            <div key={post._id} className="task-card">
              <h3 className="task-title">{post.title}</h3>
              <span
                style={{
                  display: "inline-block",
                  backgroundColor:
                    post.type === "learn_request" ? "#3b82f6" : "#10b981",
                  color: "white",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  marginBottom: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {post.type === "learn_request" ? "Want to Learn" : "Want to Teach"}
              </span>
              <p className="task-description">{post.description}</p>

              <div className="task-meta">
                <div className="task-meta-item">
                  <span className="task-meta-label">Category</span>
                  <span className="task-meta-value">{post.category}</span>
                </div>
                <div className="task-meta-item">
                  <span className="task-meta-label">Status</span>
                  <span
                    className={`status-badge status-${post.status}`}
                    style={{
                      background: post.status === "open" ? "#10b981" : "#6b7280",
                      color: "#fff",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "0.25rem",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                    }}
                  >
                    {post.status === "open" ? "Open" : "Closed"}
                  </span>
                </div>
              </div>

              {post.price && (
                <div style={{ marginBottom: "0.75rem" }}>
                  <span
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      color: "var(--accent)",
                    }}
                  >
                    ₹{post.price}/session
                  </span>
                </div>
              )}

              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  marginBottom: "1rem",
                }}
              >
                By: {post.createdBy?.name || "Unknown"}
              </p>

              {post.acceptedUserId && (
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--success)",
                    fontWeight: "600",
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <CheckCircle size={16} />
                  Accepted: {post.acceptedUserId?.name}
                </p>
              )}

              {isCreator && post.applications?.length > 0 && (
                <div style={{ marginBottom: "1rem" }}>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                    }}
                  >
                    Applications ({post.applications.filter(a => a.status === "pending").length})
                  </p>
                  {post.applications.filter(a => a.status === "pending").map((application) => (
                    <div
                      key={application.userId?._id || application.userId}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.5rem",
                        background: "var(--secondary)",
                        borderRadius: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>
                          👤 {application.userId?.name || "Unknown"}
                        </span>
                        {application.proposedPrice && (
                          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            Proposed: ₹{application.proposedPrice}
                          </div>
                        )}
                      </div>
                      {post.status === "open" && (
                        <button
                          type="button"
                          className="btn-accent"
                          style={{
                            width: "auto",
                            padding: "0.5rem 1rem",
                            fontSize: "0.85rem",
                          }}
                          onClick={() => handleAccept(post._id, application.userId?._id || application.userId)}
                        >
                          Accept
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="task-actions">
                {!isCreator && post.status === "open" && !hasApplied && (
                  <button
                    type="button"
                    className="btn-accent"
                    onClick={() => handleApplyStart(post._id, post.type)}
                  >
                    Apply
                  </button>
                )}
                {hasApplied && !isAccepted && (
                  <button
                    type="button"
                    disabled
                    style={{ opacity: 0.6, cursor: "not-allowed" }}
                  >
                    Applied
                  </button>
                )}
                {isAccepted && post.status === "closed" && (
                  <button
                    type="button"
                    className="btn-accent"
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                    onClick={() => navigate(`/learnhub-chat/${post._id}`)}
                  >
                    <MessageCircle size={18} />
                    Start Chat
                  </button>
                )}
                {isCreator && post.status === "closed" && (
                  <button
                    type="button"
                    className="btn-accent"
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                    onClick={() => navigate(`/learnhub-chat/${post._id}`)}
                  >
                    <MessageCircle size={18} />
                    View Chat
                  </button>
                )}
                {post.status === "closed" && !isCreator && !isAccepted && (
                  <button
                    type="button"
                    disabled
                    style={{ opacity: 0.6, cursor: "not-allowed" }}
                  >
                    Closed
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {posts.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</p>
          <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)" }}>
            No posts found. Create one to get started!
          </p>
        </div>
      )}

      {/* Apply Modal for Learn Request Posts */}
      {applyModal.isOpen && (
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
        >
          <div
            className="card"
            style={{
              maxWidth: "500px",
              width: "90%",
              padding: "2rem",
            }}
          >
            <h3 style={{ marginTop: 0 }}>💰 Propose Your Price</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              This learner is looking for help. Propose your fee for this session.
            </p>
            
            <div className="form-group">
              <label htmlFor="proposedPrice">Your Fee (₹)</label>
              <input
                id="proposedPrice"
                type="number"
                placeholder="e.g., 500"
                value={applyModal.proposedPrice}
                onChange={(e) =>
                  setApplyModal({ ...applyModal, proposedPrice: e.target.value })
                }
                min="0"
                step="10"
              />
            </div>

            <div className="form-group">
              <label htmlFor="applyMessage">Message (Optional)</label>
              <textarea
                id="applyMessage"
                placeholder="Tell the learner about your experience..."
                value={applyModal.message}
                onChange={(e) =>
                  setApplyModal({ ...applyModal, message: e.target.value })
                }
                style={{ minHeight: "100px" }}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                type="button"
                className="btn-accent"
                style={{ flex: 1 }}
                onClick={handleApplyWithPrice}
              >
                Apply Now
              </button>
              <button
                type="button"
                style={{
                  flex: 1,
                  backgroundColor: "var(--secondary)",
                  color: "var(--text-primary)",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() =>
                  setApplyModal({ isOpen: false, postId: null, proposedPrice: "", message: "" })
                }
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnHub;
