import jwt from "jsonwebtoken";
import User from "../models/User.js";

<<<<<<< HEAD
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
=======
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
};

export const registerUser = async (req, res) => {
  try {
<<<<<<< HEAD
    const { name, email, password, role } = req.body;
=======
    const { name, email, password } = req.body;
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

<<<<<<< HEAD
    const userRole = role === "client" ? "client" : "student";
    const user = await User.create({ name, email, password, role: userRole });
    return res.status(201).json({
      token: generateToken(user._id, user.role),
=======
    const user = await User.create({ name, email, password });
    return res.status(201).json({
      token: generateToken(user._id),
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        availability: user.availability,
        earnings: user.earnings,
        role: user.role,
<<<<<<< HEAD
        trustScore: user.trustScore,
        workHistory: user.workHistory,
=======
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({
<<<<<<< HEAD
      token: generateToken(user._id, user.role),
=======
      token: generateToken(user._id),
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        availability: user.availability,
        earnings: user.earnings,
        role: user.role,
<<<<<<< HEAD
        trustScore: user.trustScore,
        workHistory: user.workHistory,
=======
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed" });
  }
};

export const getMe = async (req, res) => {
  return res.json(req.user);
};

export const updateMe = async (req, res) => {
  try {
    const { name, skills, availability } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (availability) user.availability = availability;
    if (skills) {
      user.skills = Array.isArray(skills)
        ? skills
        : String(skills)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }

    await user.save();
    return res.json({
<<<<<<< HEAD
      _id: user._id,
=======
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
      id: user._id,
      name: user.name,
      email: user.email,
      skills: user.skills,
      availability: user.availability,
      earnings: user.earnings,
      role: user.role,
<<<<<<< HEAD
      trustScore: user.trustScore,
      workHistory: user.workHistory,
=======
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
    });
  } catch (error) {
    return res.status(500).json({ message: "Profile update failed" });
  }
};
<<<<<<< HEAD

export const updateExamSchedule = async (req, res) => {
  try {
    const { examStartDate, examEndDate } = req.body;
    const user = await User.findById(req.user._id);

    if (examStartDate) user.examStartDate = new Date(examStartDate);
    if (examEndDate) user.examEndDate = new Date(examEndDate);

    await user.save();
    return res.json({
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      skills: user.skills,
      availability: user.availability,
      earnings: user.earnings,
      role: user.role,
      trustScore: user.trustScore,
      examStartDate: user.examStartDate,
      examEndDate: user.examEndDate,
      workHistory: user.workHistory,
    });
  } catch (error) {
    return res.status(500).json({ message: "Exam schedule update failed" });
  }
};
=======
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
