const pool = require('../db');

// Get all farms
exports.getFarms = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM farms');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add new farm
exports.addFarm = async (req, res) => {
  const { user_id, farm_name, crop_name, planting_date, expected_harvest } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO farms (user_id, farm_name, crop_name, planting_date, expected_harvest)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user_id, farm_name, crop_name, planting_date, expected_harvest]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};