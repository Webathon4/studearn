import { useEffect, useState } from "react";
<<<<<<< HEAD
import { User, GraduationCap, Calendar, BookOpen, CheckCircle } from "lucide-react";
=======
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
import api from "../services/api.js";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", skills: "", availability: "" });
<<<<<<< HEAD
  const [examForm, setExamForm] = useState({ examStartDate: "", examEndDate: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isExamPeriod, setIsExamPeriod] = useState(false);

  const checkExamPeriod = (startDate, endDate) => {
    if (!startDate || !endDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return today >= start && today <= end;
  };
=======
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768

  const loadProfile = async () => {
    try {
      const res = await api.get("/api/auth/me");
      setProfile(res.data);
      setForm({
        name: res.data.name || "",
        skills: (res.data.skills || []).join(", "),
        availability: res.data.availability || "normal",
      });
<<<<<<< HEAD
      setExamForm({
        examStartDate: res.data.examStartDate ? res.data.examStartDate.split("T")[0] : "",
        examEndDate: res.data.examEndDate ? res.data.examEndDate.split("T")[0] : "",
      });
      setIsExamPeriod(checkExamPeriod(res.data.examStartDate, res.data.examEndDate));
=======
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

<<<<<<< HEAD
  const handleExamFormChange = (event) => {
    setExamForm({ ...examForm, [event.target.name]: event.target.value });
  };

=======
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      const payload = {
        name: form.name,
        availability: form.availability,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const res = await api.put("/api/auth/me", payload);
      setProfile(res.data);
<<<<<<< HEAD
      setMessage("Profile updated successfully!");
=======
      setMessage("Profile updated");
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
    } catch (err) {
      setError(err.response?.data?.message || "Profile update failed");
    }
  };

<<<<<<< HEAD
  const handleExamSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      const payload = {};
      if (examForm.examStartDate) payload.examStartDate = examForm.examStartDate;
      if (examForm.examEndDate) payload.examEndDate = examForm.examEndDate;
      
      const res = await api.put("/api/auth/exam-schedule", payload);
      setProfile(res.data);
      setIsExamPeriod(checkExamPeriod(res.data.examStartDate, res.data.examEndDate));
      setMessage("Exam schedule updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Exam schedule update failed");
    }
  };

  const examWeek = profile?.availability === "exam";

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">
          <User size={32} />
          Your Profile
        </h1>
        <p className="page-description">Manage your personal information and settings</p>
      </div>

      {isExamPeriod && (
        <p className="warning alert alert-warning">
          <GraduationCap size={18} />
          Exam Mode Active: Task applications are currently disabled.
        </p>
      )}
      {examWeek && (
        <p className="warning alert alert-warning">
          <BookOpen size={18} />
          Exam week mode active: You'll see lighter tasks prioritized in your feed.
        </p>
      )}

      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <form onSubmit={handleSubmit} className="card">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          {profile?.role === "student" && (
            <>
              <div className="form-group">
                <label htmlFor="skills">Skills</label>
                <input
                  id="skills"
                  type="text"
                  name="skills"
                  placeholder="e.g., JavaScript, Python, Writing, Graphic Design"
                  value={form.skills}
                  onChange={handleChange}
                />
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0.5rem 0 0 0" }}>
                  Tip: Add skills separated by commas. These help match you with relevant tasks.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="availability">Availability</label>
                <select
                  id="availability"
                  name="availability"
                  value={form.availability}
                  onChange={handleChange}
                >
                  <option value="normal">Normal (all tasks available)</option>
                  <option value="exam week">Exam Week (lighter tasks only)</option>
                </select>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0.5rem 0 0 0" }}>
                  <Calendar size={14} style={{ verticalAlign: "middle", marginRight: "0.25rem" }} />
                  Select your current study status to filter appropriate tasks.
                </p>
              </div>
            </>
          )}

          <button type="submit">
            <CheckCircle size={18} />
            Save Changes
          </button>
        </form>

        {profile?.role === "student" && (
          <form onSubmit={handleExamSubmit} className="card" style={{ marginTop: "1.5rem" }}>
            <h3 style={{ marginTop: 0, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <GraduationCap size={22} />
              Academic Calendar
            </h3>
            <div className="form-group">
              <label htmlFor="examStartDate">Exam Start Date</label>
              <input
                id="examStartDate"
                type="date"
                name="examStartDate"
                value={examForm.examStartDate}
                onChange={handleExamFormChange}
              />
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0.5rem 0 0 0" }}>
                🗓️ Enter the date when your exam period begins.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="examEndDate">Exam End Date</label>
              <input
                id="examEndDate"
                type="date"
                name="examEndDate"
                value={examForm.examEndDate}
                onChange={handleExamFormChange}
              />
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0.5rem 0 0 0" }}>
                🗓️ Enter the date when your exam period ends.
              </p>
            </div>

            <button type="submit">📅 Save Exam Schedule</button>
          </form>
        )}

        {profile && (
          <div className="card">
            <h3>📊 Profile Summary</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
              <div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Email
                </p>
                <p style={{ margin: 0, fontWeight: "600", color: "var(--primary)" }}>
                  {profile.email}
                </p>
              </div>
              <div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Total Earnings
                </p>
                <p style={{ margin: 0, fontWeight: "600", color: "var(--success)", fontSize: "1.1rem" }}>
                  ₹{profile.earnings || 0}
                </p>
              </div>
              {profile.role === "student" && (
                <div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Active Skills
                  </p>
                  <p style={{ margin: 0, fontWeight: "600", color: "var(--primary)" }}>
                    {(profile.skills || []).length}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {profile?.role === "student" && profile?.workHistory && profile.workHistory.length > 0 && (
          <div className="card">
            <h3>📝 Work History</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {profile.workHistory.map((entry, index) => (
                <div key={index} style={{
                  padding: "0.75rem",
                  borderLeft: "3px solid var(--success)",
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "4px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "1rem" }}>
                    <div>
                      <p style={{ margin: "0 0 0.25rem 0", fontWeight: "600", color: "var(--text-primary)" }}>
                        {entry.title}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        {new Date(entry.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p style={{ margin: 0, fontWeight: "600", color: "var(--success)", fontSize: "1rem" }}>
                      ₹{entry.pay}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
=======
  const examWeek = profile?.availability === "exam week";

  return (
    <div className="card">
      <h2>Profile</h2>
      {examWeek && (
        <p className="warning">
          Exam week: focus on lighter tasks and avoid heavy workloads.
        </p>
      )}
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="skills"
          placeholder="Skills (comma separated)"
          value={form.skills}
          onChange={handleChange}
        />
        <input
          type="text"
          name="availability"
          placeholder="Availability (normal / exam week)"
          value={form.availability}
          onChange={handleChange}
        />
        <button type="submit">Save Profile</button>
      </form>
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
    </div>
  );
};

export default Profile;
