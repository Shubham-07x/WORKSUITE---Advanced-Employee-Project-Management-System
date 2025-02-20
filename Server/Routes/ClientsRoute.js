import express from "express";
import db from "../utils/db.js";

const router = express.Router();

// GET /clients - Fetch all clients
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM clients ORDER BY client_id ASC"
    );
    res.status(200).json({ success: true, clients: result.rows });
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// POST /clients - Add a new client
router.post("/", async (req, res) => {
  const { name, contact_person, email, phone, address } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: "Name and email are required",
    });
  }

  try {
    const result = await db.query(
      "INSERT INTO clients (name, contact_person, email, phone, address, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *",
      [name, contact_person, email, phone, address]
    );
    res.status(201).json({ success: true, client: result.rows[0] });
  } catch (error) {
    console.error("Error adding client:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// DELETE /clients/:clientId - Delete a client
router.delete("/:clientId", async (req, res) => {
  const { clientId } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM clients WHERE client_id = $1 RETURNING *",
      [clientId]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export { router as clientsRouter };
