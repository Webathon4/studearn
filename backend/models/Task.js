import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
<<<<<<< HEAD
    pay: { type: Number, default: 0 },
    skillsRequired: { type: [String], default: [] },
    category: {
      type: String,
      enum: ["Academic", "Creative", "Physical Work"],
      required: true
    },
    location: { type: String, default: null },
    jobLocation: {
      address: { type: String },
      latitude: { type: Number },
      longitude: { type: Number }
    },
    status: {
      type: String,
      enum: ["open", "accepted", "completed", "skipped"],
      default: "open",
    },
    dueDate: { type: Date },
    dueTime: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // Coin-based payment fields (extension layer - non-breaking)
    rewardCoins: { type: Number, default: 0, min: 0 },
    isCampusTask: { type: Boolean, default: false },
=======
    pay: { type: Number, required: true },
    skillsRequired: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["open", "accepted", "completed"],
      default: "open",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
  },
  { timestamps: true }
);

<<<<<<< HEAD
// Validation: location is required only for "Physical Work" category
taskSchema.pre("save", function (next) {
  if (this.category === "Physical Work") {
    if (!this.location || this.location.trim() === "") {
      return next(new Error("Location is required for Physical Work tasks"));
    }
  } else {
    // Ensure location is null for other categories
    this.location = null;
  }
  next();
});

// Add indexes for optimized queries
taskSchema.index({ category: 1, status: 1 });
taskSchema.index({ category: 1, location: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ status: 1, category: 1 });

=======
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
const Task = mongoose.model("Task", taskSchema);
export default Task;
