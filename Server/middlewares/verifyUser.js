import jwt from "jsonwebtoken";

export const verifyUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({ Status: false, Error: "Not Authenticated" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ Status: false, Error: "Invalid Token" });
    }
    // Attach user info to req
    req.role = decoded.role;
    req.id = decoded.id;
    next();
  });
};
