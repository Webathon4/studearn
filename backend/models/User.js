import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
<<<<<<< HEAD
    profilePhoto: { type: String, default: null },
=======
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
    skills: { type: [String], default: [] },
    availability: { type: String, default: "normal" },
    earnings: { type: Number, default: 0 },
    role: { type: String, default: "student" },
<<<<<<< HEAD
    trustScore: { type: Number, default: 100, min: 0 },
    rating: { type: Number, default: 5, min: 0, max: 5 },
    cancellationCount: { type: Number, default: 0, min: 0 },
    examStartDate: Date,
    examEndDate: Date,
    workHistory: [
      {
        taskId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Task"
        },
        title: String,
        pay: Number,
        completedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
=======
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
  },
  { timestamps: true }
);

// Hash password before saving a new or updated user.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
