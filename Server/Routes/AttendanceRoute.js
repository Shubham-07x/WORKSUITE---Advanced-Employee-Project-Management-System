import express from "express";
import db from "../utils/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    const result = await db.query(
      `SELECT 
         COUNT(*) FILTER (WHERE clock_in::date = $1) AS present,
         (SELECT COUNT(*) FROM employee) - COUNT(*) FILTER (WHERE clock_in::date = $1) AS absent
       FROM clock_records
       WHERE clock_in::date = $1`,
      [today]
    );
    res.status(200).json({ success: true, attendance: result.rows[0] });
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export { router as attendanceRouter };
