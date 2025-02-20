import express from "express";
import db from "../utils/db.js";
import { io } from "../index.js";

const router = express.Router();

/**
 * PUT /tasks/:taskId
 * Update a task.
 */
router.put("/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const { description, deadline, status, employee_ids, project_id } = req.body;

  // Validate required fields
  if (!description || !deadline || !status || !project_id) {
    return res.status(400).json({
      success: false,
      message: "Description, deadline, status, and project ID are required",
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
      SET description = $1,
          deadline = $2,
          status = $3,
          project_id = $4,
          updated_at = NOW()
      WHERE task_id = $5
      RETURNING *;
    `;
    const { rows } = await db.query(updateQuery, [
      description,
      deadline,
      status,
      project_id,
      taskId,
    ]);
    const updatedTask = rows[0];

    // 3. Update task assignments
    await db.query("DELETE FROM task_assignments WHERE task_id = $1", [taskId]);
    const assignmentPromises = employee_ids.map((employee_id) =>
      db.query(
        "INSERT INTO task_assignments (task_id, employee_id) VALUES ($1, $2)",
        [taskId, employee_id]
      )
    );
    await Promise.all(assignmentPromises);

    // 4. Real-time notifications after task update
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

    // 5. Fetch assigned employees for this task
    const assignmentQuery = `
      SELECT ta.employee_id, e.name AS employee_name
      FROM task_assignments ta
      JOIN employee e ON ta.employee_id = e.id
      WHERE ta.task_id = $1
    `;
    const assignmentResult = await db.query(assignmentQuery, [taskId]);

    // Build arrays of IDs and names
    const assignedEmployeeIds = assignmentResult.rows.map(
      (row) => row.employee_id
    );
    const assignedEmployeeNames = assignmentResult.rows.map(
      (row) => row.employee_name
    );

    // Attach them to updatedTask
    updatedTask.employee_ids = assignedEmployeeIds;
    updatedTask.employee_names = assignedEmployeeNames;

    return res.status(200).json({ success: true, task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

/**
 * POST /tasks
 * Create a new task.
 */
router.post("/", async (req, res) => {
  const { description, deadline, status, employee_ids, project_id } = req.body;

  // Validate required fields
  if (!description || !deadline || !status || !project_id) {
    return res.status(400).json({
      success: false,
      message: "Description, deadline, status, and project ID are required",
    });
  }

  try {
    // 1. Insert the new task into the database
    const insertQuery = `
      INSERT INTO tasks (description, deadline, status, project_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *;
    `;
    const { rows } = await db.query(insertQuery, [
      description,
      deadline,
      status,
      project_id,
    ]);
    const newTask = rows[0];

    // 2. Insert task assignments
    const assignmentPromises = employee_ids.map((employee_id) =>
      db.query(
        "INSERT INTO task_assignments (task_id, employee_id) VALUES ($1, $2)",
        [newTask.task_id, employee_id]
      )
    );
    await Promise.all(assignmentPromises);

    // 3. Real-time notifications after task creation
    const assignedRows = await db.query(
      "SELECT employee_id FROM task_assignments WHERE task_id = $1",
      [newTask.task_id]
    );

    // Notify all assigned employees
    assignedRows.rows.forEach((row) => {
      io.to(`user_${row.employee_id}`).emit("taskAssigned", {
        taskId: newTask.task_id,
        status,
        message: `Task #${newTask.task_id} has been assigned to you`,
      });
    });

    // 4. Fetch assigned employees for this task
    const assignmentQuery = `
      SELECT ta.employee_id, e.name AS employee_name
      FROM task_assignments ta
      JOIN employee e ON ta.employee_id = e.id
      WHERE ta.task_id = $1
    `;
    const assignmentResult = await db.query(assignmentQuery, [newTask.task_id]);

    // Build arrays of IDs and names
    const assignedEmployeeIds = assignmentResult.rows.map(
      (row) => row.employee_id
    );
    const assignedEmployeeNames = assignmentResult.rows.map(
      (row) => row.employee_name
    );

    // Attach them to newTask
    newTask.employee_ids = assignedEmployeeIds;
    newTask.employee_names = assignedEmployeeNames;

    return res.status(201).json({ success: true, task: newTask });
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

/**
 * DELETE /tasks/:taskId
 * Delete a task.
 */
router.delete("/:taskId", async (req, res) => {
  const { taskId } = req.params;

  try {
    const deleteQuery = `
      DELETE FROM tasks
      WHERE task_id = $1
      RETURNING *;
    `;
    const { rows } = await db.query(deleteQuery, [taskId]);
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    // Notify all assigned employees about task deletion
    const assignedRows = await db.query(
      "SELECT employee_id FROM task_assignments WHERE task_id = $1",
      [taskId]
    );

    assignedRows.rows.forEach((row) => {
      io.to(`user_${row.employee_id}`).emit("taskDeleted", {
        taskId,
        message: `Task #${taskId} has been deleted`,
      });
    });

    return res
      .status(200)
      .json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

/**
 * PATCH /tasks/:taskId/reassign
 * Reassign a task to different employees.
 */
router.patch("/:taskId/reassign", async (req, res) => {
  const { taskId } = req.params;
  const { employee_ids } = req.body;

  if (!employee_ids || employee_ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Employee IDs are required for reassignment",
    });
  }

  try {
    // Update task assignments
    await db.query("DELETE FROM task_assignments WHERE task_id = $1", [taskId]);
    const assignmentPromises = employee_ids.map((employee_id) =>
      db.query(
        "INSERT INTO task_assignments (task_id, employee_id) VALUES ($1, $2)",
        [taskId, employee_id]
      )
    );
    await Promise.all(assignmentPromises);

    // Real-time notifications after task reassignment
    const assignedRows = await db.query(
      "SELECT employee_id FROM task_assignments WHERE task_id = $1",
      [taskId]
    );

    // Notify all assigned employees
    assignedRows.rows.forEach((row) => {
      io.to(`user_${row.employee_id}`).emit("taskReassigned", {
        taskId,
        message: `Task #${taskId} has been reassigned`,
      });
    });

    // Fetch assigned employees for this task
    const assignmentQuery = `
      SELECT ta.employee_id, e.name AS employee_name
      FROM task_assignments ta
      JOIN employee e ON ta.employee_id = e.id
      WHERE ta.task_id = $1
    `;
    const assignmentResult = await db.query(assignmentQuery, [taskId]);

    // Build arrays of IDs and names
    const assignedEmployeeIds = assignmentResult.rows.map(
      (row) => row.employee_id
    );
    const assignedEmployeeNames = assignmentResult.rows.map(
      (row) => row.employee_name
    );

    return res.status(200).json({
      success: true,
      message: "Task reassigned successfully",
      employee_ids: assignedEmployeeIds,
      employee_names: assignedEmployeeNames,
    });
  } catch (error) {
    console.error("Error reassigning task:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Route to fetch all employees
// After: Join employee and category to get the category name as role
router.get("/list", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT e.id,
             e.name,
             c.name AS role
      FROM employee e
      LEFT JOIN category c ON e.category_id = c.id
      ORDER BY e.id ASC
    `);
    res.status(200).json({ success: true, employees: result.rows });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// GET /tasks
router.get("/", async (req, res) => {
  try {
    const { project_id } = req.query;

    let query = `
      SELECT
        t.task_id,
        t.description,
        t.deadline,
        t.status,
        t.project_id,
        t.created_at,
        t.updated_at
      FROM tasks t
      WHERE 1=1
    `;
    const values = [];

    if (project_id && !isNaN(parseInt(project_id, 10))) {
      values.push(parseInt(project_id, 10));
      query += ` AND t.project_id = $${values.length}`;
    }

    // Run the main tasks query
    const tasksResult = await db.query(query, values);
    const tasks = tasksResult.rows; // array of tasks

    // Fetch all task assignments and employee names
    const assignmentQuery = `
      SELECT ta.task_id, ta.employee_id, e.name AS employee_name
      FROM task_assignments ta
      JOIN employee e ON ta.employee_id = e.id
    `;
    const assignmentResult = await db.query(assignmentQuery);

    // Group employees by task_id
    const assignmentsByTask = {};
    assignmentResult.rows.forEach((row) => {
      if (!assignmentsByTask[row.task_id]) {
        assignmentsByTask[row.task_id] = {
          employee_ids: [],
          employee_names: [],
        };
      }
      assignmentsByTask[row.task_id].employee_ids.push(row.employee_id);
      assignmentsByTask[row.task_id].employee_names.push(row.employee_name);
    });

    // Attach the employee arrays to each task
    const finalTasks = tasks.map((task) => {
      const assigned = assignmentsByTask[task.task_id] || {
        employee_ids: [],
        employee_names: [],
      };
      return {
        ...task,
        employee_ids: assigned.employee_ids,
        employee_names: assigned.employee_names,
      };
    });

    return res.json({ success: true, tasks: finalTasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

/**
 * GET /tasks/ongoing
 * Retrieve ongoing tasks with assigned user information.
 */
router.get("/ongoing", async (req, res) => {
  try {
    const tasksResult = await db.query(
      `SELECT t.task_id, t.description, t.deadline, t.status, t.project_id, t.created_at, t.updated_at
       FROM tasks t
       WHERE t.status != 'Completed'
       ORDER BY t.deadline ASC`
    );
    const tasks = tasksResult.rows; // array of tasks

    // Fetch all task assignments and employee names
    const assignmentQuery = `
      SELECT ta.task_id, ta.employee_id, e.name AS employee_name
      FROM task_assignments ta
      JOIN employee e ON ta.employee_id = e.id
    `;
    const assignmentResult = await db.query(assignmentQuery);

    // Group employees by task_id
    const assignmentsByTask = {};
    assignmentResult.rows.forEach((row) => {
      if (!assignmentsByTask[row.task_id]) {
        assignmentsByTask[row.task_id] = {
          employee_ids: [],
          employee_names: [],
        };
      }
      assignmentsByTask[row.task_id].employee_ids.push(row.employee_id);
      assignmentsByTask[row.task_id].employee_names.push(row.employee_name);
    });

    // Attach the employee arrays to each task
    const finalTasks = tasks.map((task) => {
      const assigned = assignmentsByTask[task.task_id] || {
        employee_ids: [],
        employee_names: [],
      };
      return {
        ...task,
        employee_ids: assigned.employee_ids,
        employee_names: assigned.employee_names,
      };
    });

    return res.json({ success: true, tasks: finalTasks });
  } catch (error) {
    console.error("Error fetching ongoing tasks:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

/**
 * PUT /tasks/:taskId
 * Update a task.
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

/**
 * GET /tasks/employee/:employeeId
 * Retrieve tasks assigned to a specific employee.
 */
router.get("/employee/:employeeId", async (req, res) => {
  const { employeeId } = req.params;

  try {
    const tasksResult = await db.query(
      `SELECT t.task_id, t.description, t.deadline, t.status, t.project_id, t.created_at, t.updated_at, p.title AS project_title
       FROM tasks t
       JOIN task_assignments ta ON t.task_id = ta.task_id
       JOIN projects p ON t.project_id = p.project_id
       WHERE ta.employee_id = $1
       ORDER BY t.deadline ASC`,
      [employeeId]
    );
    const tasks = tasksResult.rows; // array of tasks

    return res.json({ success: true, tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

export { router as taskRouter };
