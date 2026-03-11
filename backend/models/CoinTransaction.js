import mongoose from "mongoose";

const coinTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit", "lock", "release"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    referenceTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "completed",
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Index for faster queries
coinTransactionSchema.index({ userId: 1, createdAt: -1 });
coinTransactionSchema.index({ referenceTaskId: 1 });

const CoinTransaction = mongoose.model("CoinTransaction", coinTransactionSchema);
export default CoinTransaction;
