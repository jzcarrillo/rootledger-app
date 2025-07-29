const express = require('express');
const amqp = require('amqplib');
const Redis = require('ioredis');
const { Client } = require('pg');
const { landTitleSchema } = require('./zod-schemas');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Redis Client
const redis = new Redis({ host: 'redis', port: 6379 });

// PostgreSQL Client
const pgClient = new Client({
  host: 'postgres-landregistry',
  port: 5432,
  user: 'myuser',
  password: 'mypass',
  database: 'mydb'
});

pgClient.connect()
  .then(() => console.log('[✓] Connected to PostgreSQL'))
  .catch(err => console.error('[✗] PostgreSQL connection error:', err.message));

// ───────────────────────────────────────────────
// Redis Test Routes (Optional)
app.get('/set', async (req, res) => {
  try {
    await redis.set('mykey', 'Hello from Redis!');
    res.send('✅ Key set in Redis');
  } catch (err) {
    console.error('[✗] Redis SET error:', err.message);
    res.status(500).send('Redis error');
  }
});

app.get('/get', async (req, res) => {
  try {
    const value = await redis.get('mykey');
    res.send(`Value from Redis: ${value}`);
  } catch (err) {
    console.error('[✗] Redis GET error:', err.message);
    res.status(500).send('Redis error');
  }
});
// ───────────────────────────────────────────────

// PostgreSQL Table Init (run once)
const initTable = async () => {
  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS land_titles (
      id SERIAL PRIMARY KEY,
      owner_name VARCHAR(255),
      contact_no VARCHAR(20),
      title_number SERIAL,
      address TEXT,
      property_location VARCHAR(100),
      lot_number INT,
      survey_number SERIAL,
      area_size NUMERIC,
      classification VARCHAR(50),
      registration_date DATE,
      registrar_office VARCHAR(100),
      previous_title_number VARCHAR(100),
      encumbrances TEXT,
      status VARCHAR(50) DEFAULT 'Active',
      attachments JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('[✓] PostgreSQL table initialized');
};

// Process Payload and Insert to DB
app.post('/process', async (req, res) => {
  const payload = req.body;

  if (!payload || Object.keys(payload).length === 0) {
    return res.status(400).json({ message: '❌ Empty or invalid payload' });
  }

    // ✅ Validate with Zod
  const parsed = landTitleSchema.safeParse(payload);
  if (!parsed.success) {
    console.error('[✗] Zod validation failed:', parsed.error.format());
    return res.status(400).json({
      message: '❌ Zod validation failed',
      errors: parsed.error.format(),
    });
  }

  const data = parsed.data;

  const {
    owner_name,
    contact_no,
    address,
    property_location,
    lot_number,
    area_size,
    classification,
    registration_date,
    registrar_office,
    previous_title_number,
    encumbrances,
    attachments,
  } = data;

  try {
    const insertQuery = `
      INSERT INTO land_titles (
        owner_name, contact_no, address, property_location, lot_number,
        area_size, classification, registration_date, registrar_office,
        previous_title_number, encumbrances, attachments
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12
      )
    `;

    const values = [
      owner_name,
      contact_no,
      address,
      property_location,
      lot_number,
      area_size,
      classification,
      registration_date,
      registrar_office,
      previous_title_number,
      encumbrances,
      JSON.stringify(attachments || []),
    ];

    await pgClient.query(insertQuery, values);
    console.log('[✓] Inserted structured payload into PostgreSQL:', payload);
    res.status(201).json({ message: '✅ Stored in DB' });
  } catch (err) {
    console.error('[✗] Failed to insert into DB:', err.message);
    res.status(500).json({ message: '❌ PostgreSQL insert failed' });
  }
});

// Logs Reader: Return All Records
app.get('/logs', async (req, res) => {
  try {
    const result = await pgClient.query(`SELECT * FROM land_titles ORDER BY id DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error('[✗] Failed to fetch from DB:', err.message);
    res.status(500).json({ error: '❌ Failed to fetch data' });
  }
});

// Health Check
app.get('/', async (req, res) => {
  try {
    await pgClient.query('SELECT 1');
    res.send(`
      <html><body><h2 style="color:green;">✅ Backend is connected to PostgreSQL</h2></body></html>
    `);
  } catch (err) {
    console.error('❌ DB Error:', err.message);
    res.status(500).send(`
      <html><body><h2 style="color:red;">❌ Cannot connect to PostgreSQL</h2></body></html>
    `);
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', async () => {
  await initTable();
  console.log(`🚀 Backend listening on port ${PORT}`);
});
