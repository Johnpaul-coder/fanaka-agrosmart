// backend/controllers/dashboardController.js
const db = require('../db');

// Get summary statistics for dashboard
exports.getDashboard = async (req, res) => {
    try {
        // Total users
        const usersRes = await db.query('SELECT COUNT(*) FROM users');
        // Total farms
        const farmsRes = await db.query('SELECT COUNT(*) FROM farms');
        // Total products in marketplace
        const productsRes = await db.query('SELECT COUNT(*) FROM marketplace');

        res.json({
            totalUsers: parseInt(usersRes.rows[0].count),
            totalFarms: parseInt(farmsRes.rows[0].count),
            totalProducts: parseInt(productsRes.rows[0].count),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};