const { query } = require('../config/db');

exports.getSuppliers = async (req, res) => {
  try {
    const { search } = req.query;
    let queryText = 'SELECT * FROM suppliers';
    let params = [];
    if (search) {
      queryText += ' WHERE LOWER(name) LIKE LOWER(:1) OR LOWER(contact_person) LIKE LOWER(:1) OR LOWER(email) LIKE LOWER(:1)';
      params.push(`%${search}%`);
    }
    queryText += ' ORDER BY id DESC';
    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.addSupplier = async (req, res) => {
  try {
    await query(
      'INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (:1, :2, :3, :4, :5)',
      [req.body.name, req.body.contact_person, req.body.email, req.body.phone, req.body.address]
    );
    const result = await query('SELECT * FROM suppliers WHERE email = :1', [req.body.email]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    await query(
      'UPDATE suppliers SET name = :1, contact_person = :2, email = :3, phone = :4, address = :5 WHERE id = :6',
      [req.body.name, req.body.contact_person, req.body.email, req.body.phone, req.body.address, req.params.id]
    );
    const result = await query('SELECT * FROM suppliers WHERE id = :1', [req.params.id]);
    if(result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const result = await query('SELECT * FROM suppliers WHERE id = :1', [req.params.id]);
    if(result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    await query('DELETE FROM suppliers WHERE id = :1', [req.params.id]);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};