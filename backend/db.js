const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',        // your postgres username
  host: 'localhost',
  database: 'fanaka_agrosmart',
  password: 'your_password', // replace with your postgres password
  port: 5432,
});

module.exports = pool;