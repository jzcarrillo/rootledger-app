const express = require('express');
const rateLimit = require('express-rate-limit');
const client = require('prom-client');
const axios = require('axios');
const os = require('os');
const multer = require('multer');
const FormData = require('form-data');
const { landTitleSchema } = require('./zod-schemas');
const z = require('zod');

// === Setup Express ===
const app = express();
const PORT = 8081;
const FRONTEND = 'http://localhost:4005';

// === Metrics setup ===
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

// === CORS setup ===
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONTEND);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// === Request counter ===
app.use((req, res, next) => {
  totalRequests.inc({ route: req.path, method: req.method });
  next();
});

// === Health and Metrics routes ===
app.get('/', (req, res) => res.send(`✅ API Gateway UP - Served by pod: ${os.hostname()}`));
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// === Multer for file handling ===
const storage = multer.memoryStorage();
const upload = multer({ storage });

// === Rate Limiter ===
const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  handler: (req, res) => {
    throttledRequests.inc({ route: '/land/register' });
    res.status(429).json({ message: 'Too many requests to /land/register' });
  },
});

// === Main POST endpoint ===
app.post('/land/register', submitLimiter, upload.array('attachments', 5), async (req, res) => {
  console.log(`[LOG] Incoming POST request to /land/register from ${os.hostname()}`);

  try {
    const attachments = req.files || [];

    // ✅ Parse JSON string in 'payload' field
    let formFields;
    try {
      formFields = JSON.parse(req.body.payload);
    } catch (err) {
      console.error('[❌ PAYLOAD PARSE ERROR]', err.message);
      return res.status(400).json({ error: 'Malformed payload' });
    }

    console.log('[DEBUG] Form fields:', formFields);
    console.log('[DEBUG] Attachments:', attachments);

    // ✅ Validate
    const result = landTitleSchema.safeParse(formFields);
    if (!result.success) {
      console.error('[❌ ZOD VALIDATION ERROR]', result.error.format());
      return res.status(400).json({
        error: 'Invalid input',
        details: result.error.errors,
      });
    }

    console.log('[✅ ZOD VALIDATION SUCCESS]');

    // ✅ Forward to producer (same logic here...)
    const formData = new FormData();
    formData.append('payload', JSON.stringify(formFields));

    attachments.forEach((file, index) => {
      if (!file?.buffer) return;
      formData.append('attachments', file.buffer, {
        filename: file.originalname || `file-${index}`,
        contentType: file.mimetype || 'application/octet-stream',
      });
    });

    const response = await axios.post(
      'http://lambda-producer:4000/register',
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 5000,
      }
    );

    console.log(`[✅ SUCCESS] Forwarded to lambda-producer-service: ${response.status}`);
    res.status(response.status).json(response.data);

  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error(`[❌ ZOD VALIDATION ERROR]`, err.errors);
      return res.status(400).json({ error: "Validation failed", details: err.errors });
    }

    console.error("❌ Unexpected error:", err.message || err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// === Start server ===
app.listen(PORT, '0.0.0.0', () => {
  console.log(` API Gateway running on port ${PORT}`);
});
