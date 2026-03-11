import { useState, useEffect } from "react";
import api from "../services/api.js";

const useWallet = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/wallet/balance");
      setBalance(res.data.coinBalance || 0);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch wallet balance");
    } finally {
      setLoading(false);
    }
  };

  const purchaseCoins = async (amount) => {
    try {
      const res = await api.post("/api/wallet/purchase-coins", { amount });
      setBalance(res.data.coinBalance || 0);
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to purchase coins" };
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return { balance, loading, error, fetchBalance, purchaseCoins };
};

export default useWallet;
