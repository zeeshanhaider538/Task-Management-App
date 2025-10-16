import express from "express";
import { validateRequest } from "../utils/validation.js";
// import Task from "../models/Task.js";
import auth from "../middleware/auth.js";
import { isDueToday } from "../utils/task.js"; // example helper if needed
import Task from "../models/Tasks.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// GET /api/tasks - list tasks for user, with optional status & dueDate filters
router.get("/", auth, async (req, res) => {
  try {
    const { status, dueDate } = req.query;
    const q = { user: req.user._id };
    if (status) q.status = status;
    if (dueDate) {
      // filter tasks due on the provided date
      const date = new Date(dueDate);
      const next = new Date(date);
      next.setDate(next.getDate() + 1);
      q.dueDate = { $gte: date, $lt: next };
    }

    const tasks = await Task.find(q).sort({ order: 1, createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// POST /api/tasks - create
router.post(
  "/",
  auth,
  [body("title").notEmpty()],
  validateRequest,
  async (req, res) => {
    // const errors = validationResult (req);
    // if (!errors.isEmpty())
    //   return res.status(400).json({ errors: errors.array() });
    try {
      const { title, description, dueDate, status } = req.body;
      // compute order as max(order)+1
      const last = await Task.findOne({ user: req.user._id }).sort({
        order: -1,
      });
      const order = last ? last.order + 1 : 0;
      const task = new Task({
        user: req.user._id,
        title,
        description,
        dueDate,
        status,
        order,
      });
      await task.save();

      // emit socket
      const io = req.app.get("io");
      io.to(req.user._id.toString()).emit("taskCreated", task);

      res.status(201).json(task);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);
// UPDATE a task
router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    if (task.user.toString() !== req.user._id.toString())
      return res.status(403).json({ error: "Forbidden" });

    const allowedFields = [
      "title",
      "description",
      "dueDate",
      "status",
      "order",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save();

    // emit via socket
    const io = req.app.get("io");
    io.to(req.user._id.toString()).emit("taskUpdated", task);

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// DELETE a task
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    if (task.user.toString() !== req.user._id.toString())
      return res.status(403).json({ error: "Forbidden" });

    await task.deleteOne();

    const io = req.app.get("io");
    io.to(req.user._id.toString()).emit("taskDeleted", { id: req.params.id });

    res.json({ msg: "Task removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// POST /api/tasks/reorder - reorder tasks after drag
router.post("/reorder", auth, async (req, res) => {
  try {
    const { orderedIds } = req.body; // array of task ids in new order
    if (!Array.isArray(orderedIds))
      return res.status(400).json({ error: "orderedIds required" });

    // update orders in parallel
    await Promise.all(
      orderedIds.map((id, idx) => Task.findByIdAndUpdate(id, { order: idx }))
    );

    const tasks = await Task.find({ user: req.user._id }).sort({ order: 1 });
    const io = req.app.get("io");
    io.to(req.user._id.toString()).emit("tasksReordered", tasks);

    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

export default router;
