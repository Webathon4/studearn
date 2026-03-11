<<<<<<< HEAD
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PenSquare, XCircle, CheckCircle, Send, MapPin, Coins } from "lucide-react";
import api from "../services/api.js";
import useWallet from "../hooks/useWallet.js";

const PostTask = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
=======
import { useState } from "react";
import api from "../services/api.js";

const PostTask = () => {
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
  const [form, setForm] = useState({
    title: "",
    description: "",
    pay: "",
    skillsRequired: "",
<<<<<<< HEAD
    category: "Academic",
    location: "",
    dueDate: "",
    dueTime: "",
    isCampusTask: false,
    rewardCoins: "",
  });
  const [jobLocation, setJobLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { balance: coinBalance } = useWallet();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userRes = await api.get("/api/auth/me");
        setUser(userRes.data);
        if (userRes.data.role !== "client") {
          navigate("/tasks");
        }
      } catch (err) {
        navigate("/login");
      }
    };
    loadUser();
  }, [navigate]);
=======
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

<<<<<<< HEAD
  const getJobCoordinates = async () => {
    if (!form.location) {
      setError("Please enter a location first");
      return;
    }

    setLocationLoading(true);
    setError("");
    setMessage("");
    
    try {
      // Using OpenStreetMap Nominatim free geocoding API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.location)}&limit=1`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'StudEarn-App'
          }
        }
      );
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.length > 0) {
        const result = data[0];
        const fullAddress = result.display_name;
        
        // Update both location field and jobLocation with complete data
        setForm(prev => ({
          ...prev,
          location: fullAddress
        }));
        
        setJobLocation({
          address: fullAddress,
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
        });
        
        setMessage(`✓ Location found: ${fullAddress.substring(0, 60)}...`);
      } else {
        setError(`No results found for "${form.location}". Try entering a city, street address, or landmark.`);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError("Request timed out. Please check your internet connection and try again.");
      } else {
        setError("Failed to find location. Please try again or manually enter coordinates.");
      }
      console.error("Geocoding error:", err);
    } finally {
      setLocationLoading(false);
    }
  };

=======
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
<<<<<<< HEAD

    // Validate coin balance for campus tasks
    if (form.isCampusTask && form.rewardCoins) {
      const coinsNeeded = Number(form.rewardCoins);
      if (coinsNeeded > coinBalance) {
        setError(`Insufficient coins. You have ${coinBalance} coins but need ${coinsNeeded} coins.`);
        return;
      }
    }

    // Validate Physical Work job coordinates
    if (form.category === "Physical Work" && !jobLocation) {
      setError("Please get coordinates for the job location");
      return;
    }

    try {
      const payload = {
        title: form.title,
        description: form.description,
=======
    try {
      const payload = {
        ...form,
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
        pay: Number(form.pay),
        skillsRequired: form.skillsRequired
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
<<<<<<< HEAD
        category: form.category,
        location: form.category === "Physical Work" ? form.location : null,
        jobLocation: form.category === "Physical Work" ? jobLocation : null,
        dueDate: form.dueDate || null,
        dueTime: form.dueTime || null,
        isCampusTask: form.isCampusTask,
        rewardCoins: form.isCampusTask ? Number(form.rewardCoins) || 0 : 0,
      };
      await api.post("/api/tasks", payload);
      setMessage("Task posted successfully");
      setForm({
        title: "",
        description: "",
        pay: "",
        skillsRequired: "",
        category: "Academic",
        location: "",
        dueDate: "",
        dueTime: "",
        isCampusTask: false,
        rewardCoins: "",
      });
      setJobLocation(null);
=======
      };
      await api.post("/api/tasks", payload);
      setMessage("Task posted successfully");
      setForm({ title: "", description: "", pay: "", skillsRequired: "" });
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post task");
    }
  };

<<<<<<< HEAD
  if (!user || user.role !== "client") {
    return (
      <div className="container">
        <p className="error alert alert-danger">
          <XCircle size={18} />
          Only clients can post tasks. Please create a client account.
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">
          <PenSquare size={32} />
          Post a New Task
        </h1>
        <p className="page-description">Create a task and let students apply to help you</p>
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        {message && <p className="success alert alert-success"><CheckCircle size={18} /> {message}</p>}
        {error && <p className="error alert alert-danger"><XCircle size={18} /> {error}</p>}

        <form onSubmit={handleSubmit} className="card">
          <div className="form-group">
            <label htmlFor="title">Task Title</label>
            <input
              id="title"
              type="text"
              name="title"
              placeholder="e.g., Website Design, Essay Writing"
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
              placeholder="Provide detailed instructions for the task..."
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>


          <div style={{ border: "1px solid var(--border)", padding: "1rem", borderRadius: "0.5rem", marginBottom: "1.5rem" }}>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name="isCampusTask"
                  checked={form.isCampusTask}
                  onChange={(e) => setForm({ ...form, isCampusTask: e.target.checked })}
                  style={{ width: "auto", cursor: "pointer" }}
                />
                <Coins size={16} style={{ color: "var(--accent)" }} />
                <span>This is a Campus Task (Coin-Based Payment)</span>
              </label>
            </div>

            {form.isCampusTask && (
              <>
                <div className="form-group" style={{ marginBottom: "0.5rem" }}>
                  <label htmlFor="rewardCoins">Reward Coins</label>
                  <input
                    id="rewardCoins"
                    type="number"
                    name="rewardCoins"
                    placeholder="How many coins to reward?"
                    value={form.rewardCoins}
                    onChange={handleChange}
                    min="0"
                    required={form.isCampusTask}
                  />
                </div>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0 }}>
                  Your coin balance: <strong style={{ color: "var(--accent)" }}>{coinBalance}</strong> coins
                  {form.rewardCoins && Number(form.rewardCoins) > coinBalance && (
                    <span style={{ color: "var(--danger)", marginLeft: "0.5rem" }}>
                      ⚠️ Insufficient balance
                    </span>
                  )}
                </p>
              </>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="pay">Payment (₹)</label>
            <input
              id="pay"
              type="number"
              name="pay"
              placeholder="How much will you pay?"
              value={form.pay}
              onChange={handleChange}
              required={!form.isCampusTask}
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

          <button type="submit">
            <Send size={18} />
            Post Task
          </button>
        </form>
      </div>
=======
  return (
    <div className="card">
      <h2>Post a Task</h2>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Task title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Task description"
          value={form.description}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="pay"
          placeholder="Pay"
          value={form.pay}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="skillsRequired"
          placeholder="Skills (comma separated)"
          value={form.skillsRequired}
          onChange={handleChange}
        />
        <button type="submit">Post Task</button>
      </form>
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
    </div>
  );
};

export default PostTask;
