
CREATE DATABASE fanaka_agrosmart;

\c fanaka_agrosmart;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(20)
);

CREATE TABLE farms (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    crop_name VARCHAR(100),
    planting_date DATE,
    expected_harvest DATE
);

CREATE TABLE marketplace (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    product_name VARCHAR(100),
    quantity INT,
    price NUMERIC(10,2),
    status VARCHAR(20)
);
