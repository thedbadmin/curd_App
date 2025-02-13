const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Create connection pool instead of single connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'cruddb',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Promisify pool for async/await usage
const promisePool = pool.promise();

// Function to initialize database
const initializeDatabase = async () => {
  try {
    // Create table if not exists
    const createTable = `
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phoneNumber VARCHAR(20),
        city VARCHAR(100),
        department VARCHAR(100),
        salary DECIMAL(10, 2),
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await promisePool.query(createTable);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
    // Wait 5 seconds and try again
    setTimeout(initializeDatabase, 5000);
  }
};

// Initialize database
initializeDatabase();

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Create
app.post('/api/employees', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, city, department, salary } = req.body;
    
    // Log the received data
    console.log('Received employee data:', req.body);

    const query = 'INSERT INTO employees (firstName, lastName, email, phoneNumber, city, department, salary) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [firstName, lastName, email, phoneNumber, city, department, parseFloat(salary) || 0];

    const [result] = await promisePool.query(query, values);
    
    // Log successful insertion
    console.log('Employee inserted successfully:', result);
    
    // Fetch the inserted record
    const [rows] = await promisePool.query('SELECT * FROM employees WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error inserting employee:', err);
    res.status(500).json({ error: err.message });
  }
});

// Read all
app.get('/api/employees', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM employees ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: err.message });
  }
});

// Read one
app.get('/api/employees/:id', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching employee:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update
app.put('/api/employees/:id', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, city, department, salary } = req.body;
    const query = 'UPDATE employees SET firstName = ?, lastName = ?, email = ?, phoneNumber = ?, city = ?, department = ?, salary = ? WHERE id = ?';
    
    const [result] = await promisePool.query(query, [
      firstName, 
      lastName, 
      email, 
      phoneNumber, 
      city, 
      department, 
      parseFloat(salary) || 0,
      req.params.id
    ]);

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }
    
    // Fetch and return the updated record
    const [rows] = await promisePool.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const [result] = await promisePool.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
