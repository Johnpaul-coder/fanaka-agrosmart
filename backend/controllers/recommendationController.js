// backend/controllers/recommendationController.js
const db = require('../db');

// Get recommended products for a user
exports.getRecommendations = async (req, res) => {
    try {
        const userId = req.params.userId;

        const query = `
            SELECT m.id, m.product_name, m.quantity, m.price, u.name AS seller
            FROM marketplace m
            JOIN users u ON m.user_id = u.id
            WHERE m.product_name IN (
                SELECT crop_name FROM farms WHERE user_id = $1
            ) AND m.status = 'available'
            ORDER BY m.price ASC
            LIMIT 10;
        `;
        const result = await db.query(query, [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
};