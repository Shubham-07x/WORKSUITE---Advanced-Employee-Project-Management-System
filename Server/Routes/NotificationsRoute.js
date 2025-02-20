import express from "express";
import db from "../utils/db.js";

const router = express.Router();

// Fetch notifications
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM notifications ORDER BY created_at DESC"
    );
    res.status(200).json({ success: true, notifications: result.rows });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Create a new notification
router.post("/", async (req, res) => {
  const { message } = req.body;

  try {
    const result = await db.query(
      "INSERT INTO notifications (message, created_at) VALUES ($1, NOW()) RETURNING *",
      [message]
    );
    res.status(201).json({ success: true, notification: result.rows[0] });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export { router as notificationRouter };
