const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Client } = require("pg");

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

// PostgreSQL Client
const pgClient = new Client({
  host: "postgres-users", // or use process.env.PGHOST
  port: 5432,
  user: "myuser",
  password: "mypass",
  database: "mydb",
});

pgClient.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("PostgreSQL connection error", err));

// Register route
app.post("/register", async (req, res) => {
  const { full_name, email, password, role } = req.body;

  try {
    // Use pgClient for queries
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

    res.status(201).json({ message: "User registered", user: result.rows[0] });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.listen(port, () => {
  console.log(`User service running on port ${port}`);
});
