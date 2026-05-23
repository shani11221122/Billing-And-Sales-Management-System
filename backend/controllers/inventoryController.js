const { query } = require('../config/db');

exports.getInventorys = async (req, res) => {
  try {
    const { search } = req.query;
    let queryText = 'SELECT * FROM inventory_transactions';
    let params = [];
    if (search) {
      queryText += ' WHERE LOWER(transaction_type) LIKE LOWER(:1) OR LOWER(notes) LIKE LOWER(:1)';
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

exports.addInventory = async (req, res) => {
  try {
    await query(
      'INSERT INTO inventory_transactions (product_id, transaction_type, quantity, reference_id, notes) VALUES (:1, :2, :3, :4, :5)',
      [req.body.product_id, req.body.transaction_type, req.body.quantity, req.body.reference_id, req.body.notes]
    );
    const result = await query('SELECT * FROM inventory_transactions WHERE product_id = :1 ORDER BY created_at DESC FETCH NEXT 1 ROWS ONLY', [req.body.product_id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    await query(
      'UPDATE inventory_transactions SET product_id = :1, transaction_type = :2, quantity = :3, reference_id = :4, notes = :5 WHERE id = :6',
      [req.body.product_id, req.body.transaction_type, req.body.quantity, req.body.reference_id, req.body.notes, req.params.id]
    );
    const result = await query('SELECT * FROM inventory_transactions WHERE id = :1', [req.params.id]);
    if(result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteInventory = async (req, res) => {
  try {
    const result = await query('SELECT * FROM inventory_transactions WHERE id = :1', [req.params.id]);
    if(result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    await query('DELETE FROM inventory_transactions WHERE id = :1', [req.params.id]);
    res.json({ message: 'Inventory deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};