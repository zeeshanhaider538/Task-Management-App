import express from "express";
import { body } from "express-validator";
import User from "../models/User.js";
import { validateRequest } from "../utils/validation.js";
import { generateToken } from "../utils/jwt.js";
// import Users from "../models/Users.js";

const router = express.Router();

// POST /api/auth/signup
router.post(
  "/signup",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  validateRequest, // <-- use utility here
  async (req, res) => {
    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ error: "User already exists" });

      user = new User({ name, email, password });
      await user.save();

      const token = generateToken(user._id); // <-- use utility here

      res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// POST /api/auth/login
router.post(
  "/login",
  [body("email").isEmail(), body("password").exists()],
  validateRequest, // <-- use utility here
  async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: "Invalid credentials" });

      const isMatch = await user.matchPassword(password);
      if (!isMatch)
        return res.status(400).json({ error: "Invalid credentials" });

      const token = generateToken(user._id); // <-- use utility here

      res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

export default router;
