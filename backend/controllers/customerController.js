const db = require('../config/db');

exports.getCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    let queryText = 'SELECT * FROM customers';
    let params = [];
    if (search) {
      queryText += ' WHERE LOWER(name) LIKE LOWER(:1) OR LOWER(email) LIKE LOWER(:1) OR LOWER(phone) LIKE LOWER(:1)';
      params.push(`%${search}%`);
    }
    queryText += ' ORDER BY id DESC';
    const customers = await db.query(queryText, params);
    res.json(customers.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    await db.query(
      'INSERT INTO customers (name, email, phone, address) VALUES (:1, :2, :3, :4)',
      [name, email, phone, address]
    );
    const newCustomer = await db.query('SELECT * FROM customers WHERE email = :1', [email]);
    res.json(newCustomer.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;
    await db.query(
      'UPDATE customers SET name=:1, email=:2, phone=:3, address=:4 WHERE id=:5',
      [name, email, phone, address, id]
    );
    const updated = await db.query('SELECT * FROM customers WHERE id = :1', [id]);
    if (updated.rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM customers WHERE id = :1', [id]);
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


