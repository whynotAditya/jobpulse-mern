import Reminder from "../models/reminder.js";
import asyncHandler from "../middleware/asyncHandler.js";

// ────────────────────────────────────────
// POST /api/reminders
// ────────────────────────────────────────
export const createReminder = asyncHandler(async (req, res) => {
    const { title, description, dueDate, priority, type, job } = req.body;

    if (!title || !dueDate) {
        res.status(400);
        throw new Error("Title and due date are required");
    }

    const reminder = await Reminder.create({
        user: req.user._id,
        title,
        description: description || "",
        dueDate,
        priority: priority || "Medium",
        type: type || "Custom",
        job: job || null,
    });

    res.status(201).json({ success: true, data: reminder });
});

// ────────────────────────────────────────
// GET /api/reminders
// Supports ?completed=false&sort=dueDate
// ────────────────────────────────────────
export const getReminders = asyncHandler(async (req, res) => {
    const query = { user: req.user._id };

    if (req.query.completed !== undefined) {
        query.completed = req.query.completed === "true";
    }

    const sort = req.query.sort || "dueDate";

    const reminders = await Reminder.find(query).sort(sort).populate("job", "title company status");

    res.json({ success: true, count: reminders.length, data: reminders });
});

// ────────────────────────────────────────
// PUT /api/reminders/:id
// ────────────────────────────────────────
export const updateReminder = asyncHandler(async (req, res) => {
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user._id });

    if (!reminder) {
        res.status(404);
        throw new Error("Reminder not found");
    }

    const allowedFields = ["title", "description", "dueDate", "priority", "type", "completed", "job"];
    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            reminder[field] = req.body[field];
        }
    });

    if (req.body.completed === true && !reminder.completedAt) {
        reminder.completedAt = new Date();
    }
    if (req.body.completed === false) {
        reminder.completedAt = null;
    }

    const updated = await reminder.save();
    res.json({ success: true, data: updated });
});

// ────────────────────────────────────────
// DELETE /api/reminders/:id
// ────────────────────────────────────────
export const deleteReminder = asyncHandler(async (req, res) => {
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user._id });

    if (!reminder) {
        res.status(404);
        throw new Error("Reminder not found");
    }

    await reminder.deleteOne();
    res.json({ success: true, message: "Reminder removed" });
});

// ────────────────────────────────────────
// PATCH /api/reminders/:id/toggle
// Quick toggle completed status
// ────────────────────────────────────────
export const toggleReminder = asyncHandler(async (req, res) => {
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user._id });

    if (!reminder) {
        res.status(404);
        throw new Error("Reminder not found");
    }

    reminder.completed = !reminder.completed;
    reminder.completedAt = reminder.completed ? new Date() : null;

    const updated = await reminder.save();
    res.json({ success: true, data: updated });
});
