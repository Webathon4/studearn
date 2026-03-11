import { useEffect, useState } from "react";
<<<<<<< HEAD
import { LayoutDashboard, DollarSign, CheckCircle, Clock, Star, Coins } from "lucide-react";
import api from "../services/api.js";
import useWallet from "../hooks/useWallet.js";
=======
import api from "../services/api.js";
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
<<<<<<< HEAD
  const { balance: coinBalance } = useWallet();
=======
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768

  const loadDashboard = async () => {
    try {
      const res = await api.get("/api/dashboard");
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
<<<<<<< HEAD
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">
          <LayoutDashboard size={32} />
          Your Dashboard
        </h1>
        <p className="page-description">Track your earnings and task progress</p>
      </div>

      {error && <p className="error alert alert-danger">{error}</p>}

      {data && (
        <>
          {data.academicWarning && (
            <p className="warning alert alert-warning">{data.academicWarning}</p>
          )}

          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <DollarSign size={16} />
                Total Earnings
              </div>
              <div className="stat-value">₹{data.earnings}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Coins size={16} />
                Coin Balance
              </div>
              <div className="stat-value" style={{ color: "var(--accent)" }}>{coinBalance}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle size={16} />
                Completed Tasks
              </div>
              <div className="stat-value">{data.completedCount}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Clock size={16} />
                Active Tasks
              </div>
              <div className="stat-value">{data.acceptedCount}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Star size={16} />
                Trust Score
              </div>
              <div style={{ fontSize: "2rem", fontWeight: "700", margin: "0.5rem 0" }}>
                <span style={{
                  color: data.trustScore > 100 ? "#10b981" : data.trustScore >= 70 ? "#f59e0b" : "#ef4444",
                  fontSize: "2rem"
                }}>
                  {data.trustScore}
                </span>
                <span style={{
                  display: "inline-block",
                  marginLeft: "0.5rem",
                  padding: "0.25rem 0.65rem",
                  borderRadius: "0.3rem",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  background: data.trustScore > 100 ? "rgba(16, 185, 129, 0.1)" : data.trustScore >= 70 ? "rgba(245, 158, 11, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  color: data.trustScore > 100 ? "#10b981" : data.trustScore >= 70 ? "#f59e0b" : "#ef4444"
                }}>
                  {data.trustScore > 100 ? "EXCELLENT" : data.trustScore >= 70 ? "GOOD" : "AT RISK"}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>Quick Stats</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              <div>
                <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Average Earning</p>
                <p style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--primary)", margin: 0 }}>
                  ₹{data.completedCount > 0 ? Math.round(data.earnings / data.completedCount) : 0}
                </p>
              </div>
              <div>
                <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Completion Rate</p>
                <p style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--success)", margin: 0 }}>
                  {data.completedCount + data.acceptedCount > 0 
                    ? Math.round((data.completedCount / (data.completedCount + data.acceptedCount)) * 100) 
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </>
=======
    <div className="card">
      <h2>Dashboard</h2>
      {error && <p className="error">{error}</p>}
      {data && (
        <div>
          {data.academicWarning && (
            <p className="warning">{data.academicWarning}</p>
          )}
          <p>Total Earnings: {data.earnings}</p>
          <p>Completed Tasks: {data.completedCount}</p>
          <p>Accepted Tasks: {data.acceptedCount}</p>
        </div>
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
      )}
    </div>
  );
};

export default Dashboard;
