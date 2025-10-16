import "dotenv/config"; // automatically loads .env
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Attach io to app for use in routes
app.set("io", io);

app.use(cors());
app.use(express.json());

// Connect to DB
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server Error" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Socket events
io.on("connection", (socket) => {
  console.log("Client connected", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected", socket.id));
});
