const express = require('express');
const rateLimit = require('express-rate-limit');
const client = require('prom-client');
const axios = require('axios');
const os = require('os');
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });



const app = express();
const PORT = 8081;
const FRONTEND = 'http://localhost:4005';

// === Metrics ===
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const totalRequests = new client.Counter({
  name: 'api_gateway_requests_total',
  help: 'Total number of requests to API Gateway',
  labelNames: ['route', 'method'],
});
const throttledRequests = new client.Counter({
  name: 'api_gateway_429_total',
  help: 'Total number of 429 responses',
  labelNames: ['route'],
});
register.registerMetric(totalRequests);
register.registerMetric(throttledRequests);

// === Middleware ===
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONTEND);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use((req, res, next) => {
  totalRequests.inc({ route: req.path, method: req.method });
  next();
});

// === Health and metrics
app.get('/', (req, res) => res.send(`✅ API Gateway UP - Served by pod: ${os.hostname()}`));

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// === Rate limiter
const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  handler: (req, res) => {
    throttledRequests.inc({ route: '/submit' });
    res.status(429).json({ message: 'Too many requests to /submit' });
  },
});

// === POST /submit forwarding to lambda-producer-service
app.post('/land/register', submitLimiter, upload.array('attachments'), async (req, res) => {
  console.log(`[LOG] Incoming POST request to /land/register from ${os.hostname()}`);
  try {
    const attachments = req.files || [];
    const formFields = req.body;

    const payload = {
      ...formFields,
      attachments: attachments.map(file => ({
        originalname: file.originalname,
        mimetype: file.mimetype,
        buffer: file.buffer.toString('base64'), // base64 encode for safe transport
      })),
    };

    const response = await axios.post(
      'http://lambda-producer:4000/register', // ✅ fixed endpoint
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    );


    console.log(`[✅ SUCCESS] Forwarded to lambda-producer-service: ${response.status}`);
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error(`[❌ ERROR] Forwarding failed: ${err.message}`);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
});

// === Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(` API Gateway running on port ${PORT}`);
});
