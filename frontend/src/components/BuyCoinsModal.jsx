import { useState } from "react";
import { X, Coins, CreditCard } from "lucide-react";
import useWallet from "../hooks/useWallet.js";

const BuyCoinsModal = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { purchaseCoins, fetchBalance } = useWallet();

  const predefinedAmounts = [100, 500, 1000, 2000, 5000];

  const handlePurchase = async (e) => {
    e.preventDefault();
    const coinAmount = parseInt(amount);

    if (!coinAmount || coinAmount <= 0) {
      setMessage("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setMessage("");

    const result = await purchaseCoins(coinAmount);
    
    if (result.success) {
      setMessage(result.message);
      setAmount("");
      await fetchBalance();
      setTimeout(() => {
        onClose();
        setMessage("");
      }, 1500);
    } else {
      setMessage(result.message);
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <Coins size={24} />
            Buy Coins
          </h2>
          <button type="button" className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ marginBottom: "1.5rem", color: "var(--text-secondary)" }}>
            Purchase coins to post campus tasks. Coins will be locked when you post a task and transferred to students upon task completion.
          </p>

          <form onSubmit={handlePurchase}>
            <div className="form-group">
              <label className="form-label">
                <CreditCard size={16} />
                Amount of Coins
              </label>
              <input
                type="number"
                className="form-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter coin amount"
                min="1"
                required
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                Quick Select:
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {predefinedAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className="btn-outline"
                    style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                    onClick={() => setAmount(preset.toString())}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {message && (
              <div className={`alert ${message.includes("Successfully") || message.includes("Success") ? "alert-success" : "alert-danger"}`}>
                {message}
              </div>
            )}

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? "Processing..." : `Purchase ${amount || "0"} Coins`}
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>

          <div style={{ marginTop: "1.5rem", padding: "1rem", background: "var(--card-bg)", borderRadius: "0.5rem", fontSize: "0.875rem" }}>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              💡 <strong>Note:</strong> This is a simulated purchase. In production, this would integrate with a real payment gateway.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyCoinsModal;
