import express from "express";
import db from "../utils/db.js";
import { io } from "../index.js";

const router = express.Router();

/**
 * PUT /taskstatus/:taskId
 * Update the status of a task.
 */
router.put("/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  // Validate required fields
  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Status is required",
    });
  }

  try {
    // 1. Fetch the task from the database
    const taskResult = await db.query(
      "SELECT * FROM tasks WHERE task_id = $1",
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    // 2. Perform the update operation on the task
    const updateQuery = `
      UPDATE tasks
      SET status = $1,
          updated_at = NOW()
      WHERE task_id = $2
      RETURNING *;
    `;
    const { rows } = await db.query(updateQuery, [status, taskId]);
    const updatedTask = rows[0];

    // 3. Real-time notifications after task update
    const assignedRows = await db.query(
      "SELECT employee_id FROM task_assignments WHERE task_id = $1",
      [taskId]
    );

    // Notify all assigned employees
    assignedRows.rows.forEach((row) => {
      io.to(`user_${row.employee_id}`).emit("taskUpdated", {
        taskId,
        status,
        message: `Task #${taskId} has been updated`,
      });
    });

    return res.status(200).json({ success: true, task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

export { router as taskStatusRouter };
