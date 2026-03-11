import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    // Expect a Bearer token in the Authorization header.
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

<<<<<<< HEAD
    // Attach both user and role to request
    req.user = user;
    req.user.role = decoded.role || user.role;
=======
    req.user = user;
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

export default protect;
