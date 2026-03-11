import mongoose from "mongoose";

const learnPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    type: {
      type: String,
      enum: ["learn_request", "teach_offer"],
      required: true,
    },
    price: {
      type: Number,
      required: function() {
        return this.type === "teach_offer";
      },
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applications: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        proposedPrice: {
          type: Number,
          required: function() {
            // Price required only for learn_request applications
            return this.parent().type === "learn_request";
          },
          default: null,
        },
        message: String,
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    acceptedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearnHubChat",
      default: null,
    },
  },
  { timestamps: true }
);

const LearnPost = mongoose.model("LearnPost", learnPostSchema);
export default LearnPost;
