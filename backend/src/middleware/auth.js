import jwt from "jsonwebtoken";
import User from "../models/User.js";
// import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  const token =
    req.header("Authorization") &&
    req.header("Authorization").startsWith("Bearer ")
      ? req.header("Authorization").split(" ")[1]
      : null;

  if (!token)
    return res.status(401).json({ error: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Token is not valid" });
  }
};

export default authMiddleware;
