const { query } = require('../config/db');

exports.getPayments = async (req, res) => {
  try {
    const { search } = req.query;
    let queryText = 'SELECT * FROM payments';
    let params = [];
    if (search) {
      queryText += ' WHERE LOWER(payment_method) LIKE LOWER(:1)';
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

exports.addPayment = async (req, res) => {
  try {
    await query(
      'INSERT INTO payments (invoice_id, amount, payment_method) VALUES (:1, :2, :3)',
      [req.body.invoice_id, req.body.amount, req.body.payment_method]
    );
    const result = await query('SELECT * FROM payments WHERE invoice_id = :1 ORDER BY id DESC FETCH NEXT 1 ROWS ONLY', [req.body.invoice_id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    await query(
      'UPDATE payments SET invoice_id = :1, amount = :2, payment_method = :3 WHERE id = :4',
      [req.body.invoice_id, req.body.amount, req.body.payment_method, req.params.id]
    );
    const result = await query('SELECT * FROM payments WHERE id = :1', [req.params.id]);
    if(result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const result = await query('SELECT * FROM payments WHERE id = :1', [req.params.id]);
    if(result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    await query('DELETE FROM payments WHERE id = :1', [req.params.id]);
    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};