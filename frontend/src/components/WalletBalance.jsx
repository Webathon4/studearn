import { Coins } from "lucide-react";
import useWallet from "../hooks/useWallet.js";

const WalletBalance = ({ showLabel = true }) => {
  const { balance, loading } = useWallet();

  if (loading) {
    return (
      <div className="wallet-balance" style={{ opacity: 0.6 }}>
        <Coins size={16} />
        <span>...</span>
      </div>
    );
  }

  return (
    <div className="wallet-balance">
      <Coins size={16} />
      <span>
        {showLabel && <span style={{ marginRight: "0.25rem" }}>Coins:</span>}
        <strong>{balance}</strong>
      </span>
    </div>
  );
};

export default WalletBalance;
