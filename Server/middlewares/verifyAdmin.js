import jwt from "jsonwebtoken";
import db from "../utils/db.js";

export const verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const adminResult = await db.query("SELECT * FROM admin WHERE id = $1", [
      decoded.id,
    ]);

    if (adminResult.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    req.adminId = decoded.id;
    next();
  } catch (error) {
    console.error("Error verifying admin:", error);
    return res.status(403).json({ success: false, message: "Access denied" });
  }
};
