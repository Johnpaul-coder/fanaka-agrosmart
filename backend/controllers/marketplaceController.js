const pool = require('../db');

// List all marketplace products
exports.getProducts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM marketplace');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add product to marketplace
exports.addProduct = async (req, res) => {
  const { user_id, farm_id, product_name, quantity, price } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO marketplace (user_id, farm_id, product_name, quantity, price)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user_id, farm_id, product_name, quantity, price]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};