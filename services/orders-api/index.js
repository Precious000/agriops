require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const amqp = require('amqplib');
const client = require('prom-client');
const pool = require('./db');

const app = express();
app.use(express.json());

client.collectDefaultMetrics();
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status']
});
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

let channel;
async function connectQueue() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await conn.createChannel();
  await channel.assertQueue('order.placed', { durable: true });
  await channel.assertQueue('field.alert', { durable: true });
}
connectQueue().catch(err => console.error('RabbitMQ connect failed:', err));

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'orders-api' }));

app.get('/listings', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM produce_listings WHERE available = TRUE');
  res.json(rows);
});

app.post('/listings', authenticate, authorize('manager', 'admin'), async (req, res) => {
  const { plot_id, crop, quantity_kg, price_per_kg } = req.body;
  if (!plot_id || !crop || !quantity_kg || !price_per_kg) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const [result] = await pool.query(
    'INSERT INTO produce_listings (plot_id, crop, quantity_kg, price_per_kg) VALUES (?, ?, ?, ?)',
    [plot_id, crop, quantity_kg, price_per_kg]
  );
  res.status(201).json({ id: result.insertId, plot_id, crop, quantity_kg, price_per_kg, available: true });
});

app.get('/listings/all', authenticate, authorize('manager', 'admin'), async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM produce_listings ORDER BY id DESC');
  res.json(rows);
});

app.post('/orders', authenticate, async (req, res) => {
  const { listing_id, quantity_kg } = req.body;
  const [[listing]] = await pool.query('SELECT * FROM produce_listings WHERE id = ?', [listing_id]);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });

  const [result] = await pool.query(
    'INSERT INTO orders (buyer_id, listing_id, quantity_kg) VALUES (?, ?, ?)',
    [req.user.id, listing_id, quantity_kg]
  );
  const amount = quantity_kg * listing.price_per_kg;
  await pool.query('INSERT INTO invoices (order_id, amount) VALUES (?, ?)', [result.insertId, amount]);

  if (channel) {
    channel.sendToQueue('order.placed', Buffer.from(JSON.stringify({
      orderId: result.insertId, buyerId: req.user.id, amount
    })), { persistent: true });
  }

  res.status(201).json({ id: result.insertId, amount });
});

app.get('/orders/mine', authenticate, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM orders WHERE buyer_id = ?', [req.user.id]);
  res.json(rows);
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => console.log(`orders-api listening on ${PORT}`));
