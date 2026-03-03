const pool = require('../db');

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create order
exports.addOrder = async (req, res) => {
  const { buyer_id, product_id, quantity, total_price } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO orders (buyer_id, product_id, quantity, total_price)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [buyer_id, product_id, quantity, total_price]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};