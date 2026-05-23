const { query } = require('../config/db');

exports.getInvoices = async (req, res) => {
  try {
    const { search } = req.query;
    let queryText = 'SELECT * FROM invoices';
    let params = [];
    if (search) {
      queryText += ' WHERE LOWER(invoice_number) LIKE LOWER(:1) OR LOWER(status) LIKE LOWER(:1)';
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

exports.addInvoice = async (req, res) => {
  try {
    await query(
      'INSERT INTO invoices (sale_id, invoice_number, status, due_date) VALUES (:1, :2, :3, :4)',
      [req.body.sale_id, req.body.invoice_number, req.body.status, new Date(req.body.due_date)]
    );
    const result = await query('SELECT * FROM invoices WHERE invoice_number = :1', [req.body.invoice_number]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    await query(
      'UPDATE invoices SET sale_id = :1, invoice_number = :2, status = :3, due_date = :4 WHERE id = :5',
      [req.body.sale_id, req.body.invoice_number, req.body.status, new Date(req.body.due_date), req.params.id]
    );
    const result = await query('SELECT * FROM invoices WHERE id = :1', [req.params.id]);
    if(result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const result = await query('SELECT * FROM invoices WHERE id = :1', [req.params.id]);
    if(result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    await query('DELETE FROM invoices WHERE id = :1', [req.params.id]);
    res.json({ message: 'Invoice deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};