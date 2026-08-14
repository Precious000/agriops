require('dotenv').config();
const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const client = require('prom-client');
const pool = require('./db');
const { uploadPhoto } = require('./s3');

const app = express();
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

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

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'farms-api' }));

app.post('/farms', authenticate, async (req, res) => {
  const { name, location } = req.body;
  const [result] = await pool.query(
    'INSERT INTO farms (owner_id, name, location) VALUES (?, ?, ?)',
    [req.user.id, name, location]
  );
  res.status(201).json({ id: result.insertId, name, location });
});

app.get('/farms', authenticate, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM farms WHERE owner_id = ?', [req.user.id]);
  res.json(rows);
});

app.post('/plots', authenticate, async (req, res) => {
  const { farm_id, name, crop, latitude, longitude } = req.body;
  const [result] = await pool.query(
    'INSERT INTO plots (farm_id, name, crop, latitude, longitude) VALUES (?, ?, ?, ?, ?)',
    [farm_id, name, crop, latitude, longitude]
  );
  res.status(201).json({ id: result.insertId });
});

app.get('/plots', authenticate, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT plots.* FROM plots
     JOIN farms ON plots.farm_id = farms.id
     WHERE farms.owner_id = ?`,
    [req.user.id]
  );
  res.json(rows);
});

app.post('/tasks', authenticate, async (req, res) => {
  const { plot_id, assigned_to, task_type, due_date } = req.body;
  const [result] = await pool.query(
    'INSERT INTO tasks (plot_id, assigned_to, task_type, due_date) VALUES (?, ?, ?, ?)',
    [plot_id, assigned_to, task_type, due_date]
  );
  res.status(201).json({ id: result.insertId });
});

app.get('/tasks/mine', authenticate, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM tasks WHERE assigned_to = ?', [req.user.id]);
  res.json(rows);
});

app.post('/field-logs', authenticate, upload.single('photo'), async (req, res) => {
  const { task_id, latitude, longitude, notes } = req.body;
  let photo_url = null;
  if (req.file) {
    photo_url = await uploadPhoto(req.file.buffer, req.file.mimetype);
  }
  const [result] = await pool.query(
    'INSERT INTO field_logs (task_id, worker_id, photo_url, latitude, longitude, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [task_id, req.user.id, photo_url, latitude, longitude, notes]
  );
  await pool.query("UPDATE tasks SET status = 'done' WHERE id = ?", [task_id]);
  res.status(201).json({ id: result.insertId, photo_url });
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`farms-api listening on ${PORT}`));
