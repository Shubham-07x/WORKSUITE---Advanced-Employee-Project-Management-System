import express from "express";
import db from "../utils/db.js";

const router = express.Router();

/**
 * GET /projects/ongoing
 * Retrieve projects created within the last week.
 */
router.get("/ongoing", async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const result = await db.query(
      "SELECT * FROM projects WHERE created_at >= $1 ORDER BY start_date ASC",
      [oneWeekAgo]
    );
    res.status(200).json({ success: true, projects: result.rows });
  } catch (error) {
    console.error("Error fetching ongoing projects:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/**
 * GET /projects
 * Retrieve all projects.
 */
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM projects ORDER BY project_id ASC"
    );
    res.status(200).json({ success: true, projects: result.rows });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/**
 * GET /projects/:id
 * Retrieve a single project by ID.
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      "SELECT * FROM projects WHERE project_id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }
    res.status(200).json({ success: true, project: result.rows[0] });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/**
 * POST /projects
 * Create a new project.
 * Example body: { "title": "New Project", "description": "Some details", "status": "Not Started", "completion_date": "2025-12-31", "start_date": "2025-01-01", "priority": "Medium", "client_id": 1 }
 */
router.post("/", async (req, res) => {
  const {
    title,
    description,
    status,
    completion_date,
    start_date,
    priority,
    client_id,
  } = req.body;

  try {
    const insertQuery = `
      INSERT INTO projects (title, description, status, completion_date, start_date, priority, client_id, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const { rows } = await db.query(insertQuery, [
      title,
      description,
      status,
      completion_date,
      start_date,
      priority,
      client_id,
      1,
    ]); // Assuming admin ID is 1
    res.status(201).json({ success: true, project: rows[0] });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/**
 * PUT /projects/:id
 * Update a project by ID.
 * Example body: { "title": "Updated Project", "description": "Updated details", "status": "In Progress", "completion_date": "2025-12-31", "start_date": "2025-01-01", "priority": "High", "client_id": 1 }
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    status,
    completion_date,
    start_date,
    priority,
    client_id,
  } = req.body;

  try {
    const updateQuery = `
      UPDATE projects
      SET title = $1,
          description = $2,
          status = $3,
          completion_date = $4,
          start_date = $5,
          priority = $6,
          client_id = $7,
          updated_at = NOW()
      WHERE project_id = $8
      RETURNING *;
    `;
    const { rows } = await db.query(updateQuery, [
      title,
      description,
      status,
      completion_date,
      start_date,
      priority,
      client_id,
      id,
    ]);
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }
    res.status(200).json({ success: true, project: rows[0] });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/**
 * DELETE /projects/:id
 * Delete a project by ID.
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deleteQuery = `
      DELETE FROM projects
      WHERE project_id = $1
      RETURNING *;
    `;
    const { rows } = await db.query(deleteQuery, [id]);
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export { router as projectRouter };
