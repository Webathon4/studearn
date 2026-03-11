import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
  {
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true },
    bidTime: { type: Date, default: Date.now },
  },
  { _id: false }
);

const auctionSchema = new mongoose.Schema(
  {
    bookTitle: { type: String, required: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true },
    currentHighestBid: {
      type: Number,
      default: function () {
        return this.basePrice;
      },
    },
    highestBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bids: { type: [bidSchema], default: [] },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "ended"],
      default: "active",
    },
    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const Auction = mongoose.model("Auction", auctionSchema);
export default Auction;
