
import express from 'express';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());

// SQL Connection Pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'sentinel_admin',
  password: process.env.DB_PASSWORD || 'sentinel_pass',
  database: process.env.DB_NAME || 'sentinel_logs',
  port: process.env.DB_PORT || 5432,
});

// Initialize Database Tables
const initDb = async () => {
  try {
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT,
        ip_address TEXT,
        port TEXT,
        model TEXT,
        status TEXT
      );
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT,
        primary_method TEXT,
        sync_status TEXT DEFAULT 'synced',
        enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS logs (
        id TEXT PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id TEXT,
        user_name TEXT,
        department TEXT,
        device_id TEXT,
        method TEXT,
        status TEXT,
        details TEXT
      );
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value JSONB
      );
    `);
    client.release();
    console.log('SQL Tables Initialized Successfully');
  } catch (err) {
    console.error('Database Initialization Error:', err.message);
  }
};

// --- API Endpoints ---

// Settings Management
app.get('/api/settings/:key', async (req, res) => {
  try {
    const result = await pool.query('SELECT value FROM settings WHERE key = $1', [req.params.key]);
    res.json(result.rows[0]?.value || null);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.post('/api/settings/:key', async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
      [req.params.key, req.body]
    );
    res.status(201).json({ message: 'Settings saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Device Management
app.get('/api/devices', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM devices');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

app.post('/api/devices', async (req, res) => {
  try {
    const d = req.body;
    await pool.query(
      'INSERT INTO devices (id, name, location, ip_address, port, model, status) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO UPDATE SET name = $2, location = $3, ip_address = $4, port = $5',
      [d.id, d.name, d.location, d.ipAddress, d.port, d.model, d.status]
    );
    res.status(201).json({ message: 'Device saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save device' });
  }
});

// Log Management
app.get('/api/logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

app.post('/api/logs', async (req, res) => {
  try {
    const l = req.body;
    await pool.query(
      'INSERT INTO logs (id, timestamp, user_id, user_name, department, device_id, method, status, details) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
      [l.id, l.timestamp, l.userId, l.userName, l.department, l.deviceId, l.method, l.status, l.details]
    );
    res.status(201).json({ message: 'Log saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save log' });
  }
});

// User Management
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const u = req.body;
    await pool.query(
      'INSERT INTO users (id, name, department, primary_method, sync_status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET name = $2, department = $3, primary_method = $4',
      [u.id, u.name, u.department, u.primaryMethod, u.syncStatus || 'synced']
    );
    res.status(201).json({ message: 'User saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save user' });
  }
});

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sentinel Backend running on port ${PORT}`);
  initDb();
});
