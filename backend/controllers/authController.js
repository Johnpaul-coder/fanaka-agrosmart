const pool = require('../db');
const bcrypt = require('bcrypt');

// Register user
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashed, role || 'farmer']
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, userRes.rows[0].password);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });

    res.json({ message: 'Login successful', user: userRes.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};