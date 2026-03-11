import Task from "../models/Task.js";

export const matchTasks = async (req, res) => {
  try {
    const userSkills = req.user.skills || [];
    const availability = req.user.availability || "normal";

    const openTasks = await Task.find({ status: "open" });

    // Match by skill overlap, then rank by overlap count and pay.
    const matched = openTasks
      .map((task) => {
        const intersectionCount = (task.skillsRequired || []).filter((skill) =>
          userSkills.includes(skill)
        ).length;
        return { task, intersectionCount };
      })
      .filter((item) => item.intersectionCount > 0)
      .filter((item) =>
        availability === "exam week" ? item.task.pay <= 500 : true
      )
      .sort((a, b) => {
        if (b.intersectionCount !== a.intersectionCount) {
          return b.intersectionCount - a.intersectionCount;
        }
        return b.task.pay - a.task.pay;
      })
      .map((item) => item.task);

    return res.json({
      warning: availability === "exam week" ? "Exam week: lighter tasks only" : null,
      tasks: matched,
    });
  } catch (error) {
    return res.status(500).json({ message: "AI match failed" });
  }
};
