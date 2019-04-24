DROP TABLE IF EXISTS bamazon.dept;
CREATE TABLE bamazon.dept(
dept_id INT AUTO_INCREMENT,
dept_name VARCHAR(50),
overhead DECIMAL(10,2),
sales INT,
revenue DECIMAL(10,2),
PRIMARY KEY(dept_id)
);

UPDATE bamazon.dept SET revenue = 0 WHERE dept_id = 6;

SELECT * 
FROM bamazon.dept;

SELECT profit
FROM bamazon.dept 
WHERE dept_name = 'home'

SELECT overhead, revenue
FROM bamazon.dept