
-- Connect to PostgreSQL and create DB
CREATE DATABASE fanaka_agrosmart;

\c fanaka_agrosmart;

-- Users table (farmers, buyers, admin)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'farmer', -- farmer, buyer, admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Farms table (each farmer can have multiple farms)
CREATE TABLE farms (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_name VARCHAR(100) NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    planting_date DATE NOT NULL,
    expected_harvest DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace table (products posted for sale)
CREATE TABLE marketplace (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_id INT REFERENCES farms(id) ON DELETE SET NULL,
    product_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL CHECK (quantity >= 0),
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    status VARCHAR(20) DEFAULT 'available', -- available, sold, pending
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table (track who bought what)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    buyer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES marketplace(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10,2) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' -- pending, completed, cancelled
);

-- Optional: Crop recommendations (based on farm location & crop type)
CREATE TABLE crop_recommendations (
    id SERIAL PRIMARY KEY,
    farm_id INT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    recommended_crop VARCHAR(100) NOT NULL,
    season VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);