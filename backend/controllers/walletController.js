import Wallet from "../models/Wallet.js";
import CoinTransaction from "../models/CoinTransaction.js";
import mongoose from "mongoose";

// Get or create wallet for a user
const getOrCreateWallet = async (userId, session = null) => {
  try {
    let wallet = session 
      ? await Wallet.findOne({ userId }).session(session)
      : await Wallet.findOne({ userId });
    
    if (!wallet) {
      if (session) {
        const newWallet = new Wallet({ userId, coinBalance: 0 });
        wallet = await newWallet.save({ session });
      } else {
        wallet = await Wallet.create({ userId, coinBalance: 0 });
      }
    }
    return wallet;
  } catch (error) {
    console.error("Error in getOrCreateWallet:", error);
    throw error;
  }
};

// Purchase coins (simulated - in production, integrate payment gateway)
export const purchaseCoins = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid coin amount" });
    }

    // Get or create wallet (without transaction for now)
    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ userId: req.user._id, coinBalance: 0 });
    }

    // Update wallet balance
    wallet.coinBalance += amount;
    await wallet.save();

    // Record transaction (without transaction for now)
    await CoinTransaction.create({
      userId: req.user._id,
      type: "credit",
      amount,
      status: "completed",
      description: `Purchased ${amount} coins`,
    });

    return res.status(200).json({
      message: `Successfully purchased ${amount} coins`,
      coinBalance: wallet.coinBalance,
      success: true,
    });
  } catch (error) {
    console.error("Purchase coins error:", error);
    return res.status(500).json({ message: error.message || "Failed to purchase coins" });
  }
};

// Get wallet balance
export const getWalletBalance = async (req, res) => {
  try {
    const wallet = await getOrCreateWallet(req.user._id, null);
    return res.status(200).json({
      coinBalance: wallet.coinBalance,
      userId: req.user._id,
    });
  } catch (error) {
    console.error("Get balance error:", error);
    return res.status(500).json({ message: "Failed to fetch wallet balance" });
  }
};

// Get transaction history
export const getTransactionHistory = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const transactions = await CoinTransaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate("referenceTaskId", "title")
      .lean();

    const total = await CoinTransaction.countDocuments({ userId: req.user._id });

    return res.status(200).json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get transaction history error:", error);
    return res.status(500).json({ message: "Failed to fetch transaction history" });
  }
};

// Internal helper: Lock coins for a task (called during task creation)
export const lockCoinsForTask = async (userId, taskId, amount, session) => {
  let wallet = await Wallet.findOne({ userId }).session(session);
  
  if (!wallet) {
    // Create wallet if it doesn't exist
    const newWallet = new Wallet({ userId, coinBalance: 0 });
    wallet = await newWallet.save({ session });
  }
  
  if (wallet.coinBalance < amount) {
    throw new Error("Insufficient coin balance");
  }

  // Deduct coins from balance (locked)
  wallet.coinBalance -= amount;
  await wallet.save({ session });

  // Record lock transaction
  await CoinTransaction.create(
    [
      {
        userId,
        type: "lock",
        amount,
        referenceTaskId: taskId,
        status: "completed",
        description: `Locked ${amount} coins for task`,
      },
    ],
    { session }
  );

  return wallet;
};

// Internal helper: Transfer locked coins to student (called during task completion)
export const transferCoinsToStudent = async (providerId, studentId, taskId, amount, session) => {
  // Credit student wallet
  const studentWallet = await getOrCreateWallet(studentId, session);
  studentWallet.coinBalance += amount;
  await studentWallet.save({ session });

  // Record debit for provider
  await CoinTransaction.create(
    [
      {
        userId: providerId,
        type: "debit",
        amount,
        referenceTaskId: taskId,
        status: "completed",
        description: `Transferred ${amount} coins for task completion`,
      },
    ],
    { session }
  );

  // Record credit for student
  await CoinTransaction.create(
    [
      {
        userId: studentId,
        type: "credit",
        amount,
        referenceTaskId: taskId,
        status: "completed",
        description: `Earned ${amount} coins from task completion`,
      },
    ],
    { session }
  );

  return studentWallet;
};

// Internal helper: Release locked coins back to provider (called during task cancellation)
export const releaseLockedCoins = async (userId, taskId, amount, session) => {
  let wallet = await Wallet.findOne({ userId }).session(session);
  
  if (!wallet) {
    // Create wallet if it doesn't exist
    const newWallet = new Wallet({ userId, coinBalance: 0 });
    wallet = await newWallet.save({ session });
  }

  // Return coins to balance
  wallet.coinBalance += amount;
  await wallet.save({ session });

  // Record release transaction
  await CoinTransaction.create(
    [
      {
        userId,
        type: "release",
        amount,
        referenceTaskId: taskId,
        status: "completed",
        description: `Released ${amount} coins (task cancelled/skipped)`,
      },
    ],
    { session }
  );

  return wallet;
};
