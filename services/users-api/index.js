require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { authenticate, authorize } = require('./middleware/auth');
const client = require('prom-client');

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
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode
    });
  });
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'users-api' }));

// Register (any role — in production, restrict admin/manager creation)
app.post('/register', async (req, res) => {
  const { full_name, email, password, role, phone } = req.body;
  if (!full_name || !email || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const hash = await bcrypt.hash(password, 10);
  try {
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, hash, role, phone]
    );
    res.status(201).json({ id: result.insertId, full_name, email, role });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already registered' });
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ token, role: user.role });
});

// Example protected, role-gated route
app.get('/workers', authenticate, authorize('admin', 'manager'), async (req, res) => {
  const [rows] = await pool.query("SELECT id, full_name, email, phone FROM users WHERE role = 'worker'");
  res.json(rows);
});

app.get('/me', authenticate, async (req, res) => {
  res.json(req.user);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`users-api listening on ${PORT}`));
