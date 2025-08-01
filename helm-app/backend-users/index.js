const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Client } = require("pg");
const authenticateToken = require("./middleware/auth");

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

// PostgreSQL Client
const pgClient = new Client({
  host: "postgres-users",
  port: 5432,
  user: "myuser",
  password: "mypass",
  database: "mydb",
});

// Add this secret key (use env in real apps)
const JWT_SECRET = "your_jwt_secret"; // TODO: move to process.env.JWT_SECRET

// Connect and initialize the users table
async function initDatabase() {
  try {
    await pgClient.connect();
    console.log("Connected to PostgreSQL");

    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Ensured users table exists");
  } catch (err) {
    console.error("PostgreSQL connection error", err);
  }
}

initDatabase();

app.post("/register", async (req, res) => {
  const { full_name, email, password, role } = req.body;

  try {
    const existing = await pgClient.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pgClient.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role, created_at`,
      [full_name, email, hashedPassword, role || "user"]
    );

    console.log("Inserted user:", result.rows[0]);
    res.status(201).json({ message: "User registered", user: result.rows[0] });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pgClient.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// Example protected route
app.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user, // This contains decoded token info: id, email, role, etc.
  });
});

app.listen(port, () => {
  console.log(`User service running on port ${port}`);
});
