import Task from "../models/Task.js";

export const getDashboard = async (req, res) => {
  try {
    const completedCount = await Task.countDocuments({
      status: "completed",
      acceptedBy: req.user._id,
    });
    const acceptedCount = await Task.countDocuments({
      status: "accepted",
      acceptedBy: req.user._id,
    });

    return res.json({
      earnings: req.user.earnings,
<<<<<<< HEAD
      trustScore: req.user.trustScore,
=======
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
      completedCount,
      acceptedCount,
      academicWarning:
        req.user.availability === "exam week"
          ? "Exam week: focus on light tasks."
          : null,
    });
  } catch (error) {
    return res.status(500).json({ message: "Dashboard fetch failed" });
  }
};
