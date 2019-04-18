DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
item_id INT AUTO_INCREMENT NOT NULL,
product_name VARCHAR(200),
department_name VARCHAR(50),
sale_price DECIMAL(10,2),
stock_quantity INT,
PRIMARY KEY (item_id)
);



SELECT * FROM products;