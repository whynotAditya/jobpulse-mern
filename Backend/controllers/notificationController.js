import Notification from "../models/notification.js";
import Reminder from "../models/reminder.js";
import asyncHandler from "../middleware/asyncHandler.js";

// ────────────────────────────────────────
// GET /api/notifications
// Returns user notifications (newest first)
// ────────────────────────────────────────
export const getNotifications = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const notifications = await Notification.find({ user: req.user._id })
        .sort("-createdAt")
        .limit(limit)
        .populate("relatedJob", "title company status")
        .populate("relatedReminder", "title dueDate");

    const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });

    res.json({ success: true, data: notifications, unreadCount });
});

// ────────────────────────────────────────
// PUT /api/notifications/:id/read
// Mark single notification as read
// ────────────────────────────────────────
export const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { read: true },
        { new: true }
    );

    if (!notification) {
        res.status(404);
        throw new Error("Notification not found");
    }

    res.json({ success: true, data: notification });
});

// ────────────────────────────────────────
// PUT /api/notifications/read-all
// Mark all notifications as read
// ────────────────────────────────────────
export const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { user: req.user._id, read: false },
        { read: true }
    );

    res.json({ success: true, message: "All notifications marked as read" });
});

// ────────────────────────────────────────
// DELETE /api/notifications/:id
// ────────────────────────────────────────
export const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });

    if (!notification) {
        res.status(404);
        throw new Error("Notification not found");
    }

    await notification.deleteOne();
    res.json({ success: true, message: "Notification removed" });
});

// ────────────────────────────────────────
// POST /api/notifications/generate
// Auto-generate notifications from reminders
// (Called on-demand or could be called via cron)
// ────────────────────────────────────────
export const generateNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find overdue and due-today reminders
    const dueReminders = await Reminder.find({
        user: userId,
        completed: false,
        dueDate: { $lte: tomorrow },
    });

    let created = 0;

    for (const reminder of dueReminders) {
        // Check if notification already exists for this reminder today
        const existing = await Notification.findOne({
            user: userId,
            relatedReminder: reminder._id,
            createdAt: { $gte: new Date(now.toDateString()) },
        });

        if (!existing) {
            const isOverdue = new Date(reminder.dueDate) < new Date(now.toDateString());
            await Notification.create({
                user: userId,
                type: "reminder_due",
                title: isOverdue ? `⚠️ Overdue: ${reminder.title}` : `📋 Due today: ${reminder.title}`,
                message: reminder.description || `Reminder is ${isOverdue ? "overdue" : "due today"}`,
                link: "/reminders",
                relatedReminder: reminder._id,
            });
            created++;
        }
    }

    res.json({ success: true, message: `Generated ${created} notification(s)` });
});
