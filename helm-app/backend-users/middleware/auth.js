// backend-users/middleware/auth.js

const jwt = require("jsonwebtoken");
const JWT_SECRET = "your_jwt_secret"; // You can use env vars later

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) return res.status(401).json({ error: "Access denied. Token missing." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token." });

    req.user = user; // Attach decoded token to request
    next();
  });
}

module.exports = authenticateToken;
