const express = require('express');
const amqp = require('amqplib');
const cors = require('cors');
const multer = require('multer');

const storage = multer.memoryStorage(); // store files in memory (you can stream to S3, etc.)
const upload = multer({ storage });

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ Request logger
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url} - Body: ${JSON.stringify(req.body)}`);
  next();
});

let channel;
let connection;
let isReconnecting = false;

const QUEUE = 'queue_land.registry';
const RABBITMQ_URL = 'amqp://myuser:mypass@rabbitmq-landregistry';

/**
 * Connect to RabbitMQ with retries and event listeners
 */
async function connectRabbitMQ(retries = 10) {
  while (retries) {
    try {
      connection = await amqp.connect(RABBITMQ_URL);
      channel = await connection.createChannel();
      await channel.assertQueue(QUEUE, { durable: true });

      console.log('[✓] Connected to RabbitMQ:', QUEUE);

      // Auto-reconnect if closed
      connection.on('close', () => {
        console.warn('⚠️ RabbitMQ connection closed. Reconnecting...');
        reconnectRabbitMQ();
      });

      connection.on('error', (err) => {
        console.error('❌ RabbitMQ connection error:', err.message);
      });

      channel.on('close', () => {
        console.warn('⚠️ RabbitMQ channel closed. Reconnecting...');
        reconnectRabbitMQ();
      });

      return;
    } catch (err) {
      console.error(`[✗] RabbitMQ connect failed: ${err.message}. Retrying in 3s...`);
      retries--;
      await new Promise(res => setTimeout(res, 3000));
    }
  }
  console.error('[✗] Failed to connect to RabbitMQ after retries.');
}

function reconnectRabbitMQ() {
  if (isReconnecting) return;
  isReconnecting = true;
  setTimeout(() => {
    connectRabbitMQ().finally(() => {
      isReconnecting = false;
    });
  }, 3000);
}

const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Lambda Producer running on port ${PORT}`);
});

connectRabbitMQ();

/**
 * POST /register
 * Queues entire request body to RabbitMQ
 */
app.post('/register', upload.fields([{ name: 'attachments', maxCount: 5 }]), async (req, res) => {
  const fields = req.body;
  const files = req.files?.attachments || [];

  console.log('[DEBUG] Received fields:', Object.keys(fields));
  console.log('[DEBUG] Received files count:', files.length);

  const data = {
    ...fields,
    attachments: files.map(file => ({
      originalname: file.originalname,
      mimetype: file.mimetype,
      buffer: file.buffer.toString('base64'),
    }))
  };

  try {
if (!channel || !channel.connection || channel.connection.stream?.destroyed) {
  console.error('[✗] RabbitMQ channel not ready or connection closed');
  console.log('[DEBUG] channel:', !!channel);
  console.log('[DEBUG] channel.connection:', !!channel?.connection);
  console.log('[DEBUG] channel.connection.stream.destroyed:', channel?.connection?.stream?.destroyed);
  return res.status(503).send('RabbitMQ not ready');
}

    const payload = Buffer.from(JSON.stringify(data));
    channel.sendToQueue(QUEUE, payload, { persistent: true });

    console.log(`[→] Published to ${QUEUE}:`, {
      ...fields,
      attachments: files.map(f => f.originalname)
    });

    res.status(200).json({ message: '✅ Message queued' });
  } catch (err) {
    console.error('[✗] Failed to queue message:', err.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Lambda Producer</title></head>
      <body style="font-family:sans-serif; padding:20px;">
        <h2 style="color:green;">✅ Lambda Producer is up and running</h2>
      </body>
    </html>
  `);
});
