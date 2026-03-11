import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gavel, TrendingUp, Clock, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import api from "../services/api.js";

const Auctions = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [form, setForm] = useState({
    bookTitle: "",
    description: "",
    basePrice: "",
    endTime: "",
  });
  const [bidAmounts, setBidAmounts] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAuctions = async () => {
    try {
      const auctionsRes = await api.get("/api/auctions");
      setAuctions(auctionsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load auctions");
    }
  };

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

  useEffect(() => {
    loadUser();
    loadAuctions();
  }, []);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      const payload = {
        bookTitle: form.bookTitle,
        description: form.description,
        basePrice: Number(form.basePrice),
        endTime: form.endTime,
      };
      const res = await api.post("/api/auctions", payload);
      setAuctions((prev) => [res.data, ...prev]);
      setForm({ bookTitle: "", description: "", basePrice: "", endTime: "" });
      setMessage("Auction created successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create auction");
    }
  };

  const handleBidChange = (id, value) => {
    setBidAmounts((prev) => ({ ...prev, [id]: value }));
  };

  const handleBid = async (id) => {
    setMessage("");
    setError("");
    try {
      const amount = Number(bidAmounts[id]);
      const res = await api.post(`/api/auctions/${id}/bid`, { amount });
      setAuctions((prev) => prev.map((auction) => (auction._id === id ? res.data : auction)));
      setBidAmounts((prev) => ({ ...prev, [id]: "" }));
      setMessage("Bid placed successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place bid");
    }
  };

  const handleEnd = async (id) => {
    setMessage("");
    setError("");
    try {
      const res = await api.put(`/api/auctions/${id}/end`);
      setAuctions((prev) => prev.map((auction) => (auction._id === id ? res.data : auction)));
      setMessage("Auction ended successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to end auction");
    }
  };

  if (!user || user.role !== "student") {
    return (
      <div className="container">
        <p className="error alert alert-danger">
          Only students can access auctions.
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">
          <Gavel size={32} />
          Used Book Auctions
        </h1>
        <p className="page-description">Create auctions and place bids on used books.</p>
      </div>

      {message && <p className="success alert alert-success"><CheckCircle size={18} /> {message}</p>}
      {error && <p className="error alert alert-danger"><XCircle size={18} /> {error}</p>}

      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <form onSubmit={handleCreate} className="card">
          <div className="form-group">
            <label htmlFor="bookTitle">Book Title</label>
            <input
              id="bookTitle"
              type="text"
              name="bookTitle"
              value={form.bookTitle}
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
            <label htmlFor="basePrice">Base Price</label>
            <input
              id="basePrice"
              type="number"
              name="basePrice"
              min="0"
              value={form.basePrice}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endTime">End Time</label>
            <input
              id="endTime"
              type="datetime-local"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit">Create Auction</button>
        </form>
      </div>

      <div className="grid" style={{ marginTop: "2rem" }}>
        {auctions.map((auction) => (
          <div key={auction._id} className="task-card">
            <h3 className="task-title">{auction.bookTitle}</h3>
            <p className="task-description">{auction.description}</p>

            <div className="task-meta">
              <div className="task-meta-item">
                <span className="task-meta-label">Base Price</span>
                <span className="task-meta-value">{auction.basePrice}</span>
              </div>
              <div className="task-meta-item">
                <span className="task-meta-label">Highest Bid</span>
                <span className="task-meta-value">{auction.currentHighestBid}</span>
              </div>
            </div>

            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Ends: {auction.endTime ? new Date(auction.endTime).toLocaleString() : "N/A"}
            </p>

            {auction.status === "ended" ? (
              <>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                  Winner: {auction.highestBidder?.name || "No bids"}
                </p>
                {auction.winnerId &&
                  (String(auction.seller?._id) === String(user._id) ||
                    String(auction.winnerId) === String(user._id)) && (
                    <button
                      type="button"
                      className="btn-accent"
                      onClick={() => navigate(`/auction-settlement/${auction._id}`)}
                    >
                      Settlement Chat
                    </button>
                  )}
              </>
            ) : (
              <div className="task-actions">
                <input
                  type="number"
                  min="0"
                  placeholder="Your bid"
                  value={bidAmounts[auction._id] || ""}
                  onChange={(event) => handleBidChange(auction._id, event.target.value)}
                  style={{ maxWidth: "140px" }}
                />
                <button type="button" onClick={() => handleBid(auction._id)}>
                  Place Bid
                </button>
                {String(auction.seller?._id) === String(user._id) && (
                  <button type="button" className="btn-secondary" onClick={() => handleEnd(auction._id)}>
                    End Auction
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Auctions;
