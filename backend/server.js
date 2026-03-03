// backend/server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',         // your DB username
  host: 'localhost',        // your DB host
  database: 'fanaka_agrosmart', // your DB name
  password: '2792',         // your DB password
  port: 5432,
});

// Make pool accessible in controllers
app.locals.db = pool;

// Test route
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Fanaka AGROSMART Backend Running', time: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import routes
const userRoutes = require('./routes/users');                 // Users CRUD
const farmRoutes = require('./routes/farms');                 // Farms CRUD
const marketplaceRoutes = require('./routes/marketplace');   // Marketplace products
const recommendationRoutes = require('./routes/recommendation'); // Recommendations

// Use routes
app.use('/users', userRoutes);
app.use('/farms', farmRoutes);
app.use('/marketplace', marketplaceRoutes);
app.use('/recommendation', recommendationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});