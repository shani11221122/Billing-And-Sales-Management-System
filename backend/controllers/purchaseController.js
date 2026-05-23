const { query } = require('../config/db');

exports.getPurchases = async (req, res) => {
  try {
    const { search } = req.query;
    let queryText = 'SELECT * FROM purchase_orders';
    let params = [];
    if (search) {
      queryText += ' WHERE LOWER(status) LIKE LOWER(:1)';
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

exports.addPurchase = async (req, res) => {
  try {
    await query(
      'INSERT INTO purchase_orders (supplier_id, user_id, total_amount, status) VALUES (:1, :2, :3, :4)',
      [req.body.supplier_id, req.body.user_id, req.body.total_amount, req.body.status]
    );
    const result = await query('SELECT * FROM purchase_orders WHERE supplier_id = :1 ORDER BY id DESC FETCH NEXT 1 ROWS ONLY', [req.body.supplier_id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updatePurchase = async (req, res) => {
  try {
    await query(
      'UPDATE purchase_orders SET supplier_id = :1, user_id = :2, total_amount = :3, status = :4 WHERE id = :5',
      [req.body.supplier_id, req.body.user_id, req.body.total_amount, req.body.status, req.params.id]
    );
    const result = await query('SELECT * FROM purchase_orders WHERE id = :1', [req.params.id]);
    if(result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.deletePurchase = async (req, res) => {
  try {
    const result = await query('SELECT * FROM purchase_orders WHERE id = :1', [req.params.id]);
    if(result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    await query('DELETE FROM purchase_orders WHERE id = :1', [req.params.id]);
    res.json({ message: 'Purchase deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};