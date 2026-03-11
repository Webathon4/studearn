import Auction from "../models/Auction.js";
import AuctionSettlementChat from "../models/AuctionSettlementChat.js";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";

const isAuctionExpired = (auction) => {
  if (!auction.endTime) {
    return false;
  }
  return new Date() > new Date(auction.endTime);
};

export const createAuction = async (req, res) => {
  try {
    const { bookTitle, description, basePrice, endTime } = req.body;

    if (!bookTitle || !description || !basePrice || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const numericBasePrice = Number(basePrice);
    const auctionEndTime = new Date(endTime);

    if (!Number.isFinite(numericBasePrice) || numericBasePrice <= 0) {
      return res.status(400).json({ message: "Base price must be a positive number" });
    }
    if (Number.isNaN(auctionEndTime.getTime())) {
      return res.status(400).json({ message: "End time must be a valid date" });
    }
    if (auctionEndTime <= new Date()) {
      return res.status(400).json({ message: "End time must be in the future" });
    }

    const auction = await Auction.create({
      bookTitle,
      description,
      basePrice: numericBasePrice,
      currentHighestBid: numericBasePrice,
      seller: req.user._id,
      endTime: auctionEndTime,
    });

    const populated = await Auction.findById(auction._id)
      .populate("highestBidder", "name")
      .populate("seller", "name");

    // Notify all students about new auction
    const students = await User.find({ role: "student" });
    const io = req.app.get("io");
    const sellerName = req.user.name || "Someone";
    
    for (const student of students) {
      if (String(student._id) !== String(req.user._id)) {
        await createNotification(
          student._id,
          "new_auction",
          `New auction: "${bookTitle}" - Starting bid ₹${numericBasePrice}`,
          auction._id,
          "Auction"
        );
        
        io.to(String(student._id)).emit("newNotification", {
          type: "new_auction",
          message: `New auction: "${bookTitle}"`,
          relatedId: auction._id,
          createdAt: new Date(),
        });
      }
    }

    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create auction" });
  }
};

export const getAuctions = async (req, res) => {
  try {
    const now = new Date();
    await Auction.updateMany(
      { status: "active", endTime: { $lt: now } },
      { status: "ended" }
    );

    const auctions = await Auction.find()
      .sort({ createdAt: -1 })
      .populate("highestBidder", "name")
      .populate("seller", "name");

    return res.json(auctions);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch auctions" });
  }
};

export const placeBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Bid amount must be a positive number" });
    }

    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    if (auction.status !== "active" || isAuctionExpired(auction)) {
      if (auction.status !== "ended") {
        auction.status = "ended";
        await auction.save();
      }
      return res.status(400).json({ message: "Auction has ended" });
    }

    if (String(auction.seller) === String(req.user._id)) {
      return res.status(403).json({ message: "Seller cannot bid on own auction" });
    }

    if (numericAmount <= auction.currentHighestBid) {
      return res.status(400).json({
        message: "Bid must be higher than current highest bid",
      });
    }

    const previousBidder = auction.highestBidder;
    auction.currentHighestBid = numericAmount;
    auction.highestBidder = req.user._id;
    auction.bids.push({ bidder: req.user._id, amount: numericAmount });
    await auction.save();

    // Notify seller about new bid
    const io = req.app.get("io");
    const bidderName = req.user.name || "Someone";
    await createNotification(
      auction.seller,
      "auction_message",
      `${bidderName} placed a new bid of ₹${numericAmount} on "${auction.bookTitle}"`,
      auction._id,
      "Auction"
    );

    io.to(String(auction.seller)).emit("newNotification", {
      type: "auction_message",
      message: `New bid: ₹${numericAmount} on "${auction.bookTitle}"`,
      relatedId: auction._id,
      createdAt: new Date(),
    });

    const populated = await Auction.findById(auction._id)
      .populate("highestBidder", "name")
      .populate("seller", "name");

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: "Failed to place bid" });
  }
};

export const endAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    if (String(auction.seller) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only the seller can end the auction" });
    }

    auction.status = "ended";
    if (auction.highestBidder) {
      auction.winnerId = auction.highestBidder;
    }
    await auction.save();

    if (auction.winnerId) {
      const existingChat = await AuctionSettlementChat.findOne({
        auctionId: auction._id,
      });
      if (!existingChat) {
        await AuctionSettlementChat.create({
          auctionId: auction._id,
          sellerId: auction.seller,
          winnerId: auction.winnerId,
          isActive: true,
        });
      }

      // Notify winner
      const io = req.app.get("io");
      const sellerName = req.user.name || "Seller";
      await createNotification(
        auction.winnerId,
        "auction_won",
        `You won the auction for "${auction.bookTitle}"! Final bid: ₹${auction.currentHighestBid}`,
        auction._id,
        "Auction"
      );

      io.to(String(auction.winnerId)).emit("newNotification", {
        type: "auction_won",
        message: `You won the auction for "${auction.bookTitle}"!`,
        relatedId: auction._id,
        createdAt: new Date(),
      });
    }

    const populated = await Auction.findById(auction._id)
      .populate("highestBidder", "name")
      .populate("seller", "name")
      .populate("winnerId", "name");

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: "Failed to end auction" });
  }
};
