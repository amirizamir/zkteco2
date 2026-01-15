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
    `);
    client.release();
    console.log('SQL Tables Initialized Successfully');
  } catch (err) {
    console.error('Database Initialization Error:', err.message);
  }
};

// API Endpoints
app.get('/api/logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

app.post('/api/logs', async (req, res) => {
  try {
    const l = req.body;
    await pool.query(
      'INSERT INTO logs (id, timestamp, user_id, user_name, department, device_id, method, status, details) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [l.id, l.timestamp, l.userId, l.userName, l.department, l.deviceId, l.method, l.status, l.details]
    );
    res.status(201).json({ message: 'Log saved successfully' });
  } catch (err) {
    console.error('Error saving log:', err);
    res.status(500).json({ error: 'Failed to save log' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
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
    res.status(201).json({ message: 'User saved successfully' });
  } catch (err) {
    console.error('Error saving user:', err);
    res.status(500).json({ error: 'Failed to save user' });
  }
});

// Serve static frontend files
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// API 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// SPA routing for frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sentinel Backend running on port ${PORT}`);
  initDb();
});