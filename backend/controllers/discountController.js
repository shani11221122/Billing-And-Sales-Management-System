const { query } = require('../config/db');

exports.getDiscounts = async (req, res) => {
  try {
    const { search } = req.query;
    let queryText = 'SELECT * FROM discounts';
    let params = [];
    if (search) {
      queryText += ' WHERE LOWER(name) LIKE LOWER(:1) OR LOWER(type) LIKE LOWER(:1)';
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

exports.addDiscount = async (req, res) => {
  try {
    await query(
      'INSERT INTO discounts (name, type, value, active) VALUES (:1, :2, :3, :4)',
      [req.body.name, req.body.type, req.body.value, req.body.active ? 1 : 0]
    );
    const result = await query('SELECT * FROM discounts WHERE name = :1 AND type = :2 ORDER BY id DESC FETCH NEXT 1 ROWS ONLY', [req.body.name, req.body.type]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateDiscount = async (req, res) => {
  try {
    await query(
      'UPDATE discounts SET name = :1, type = :2, value = :3, active = :4 WHERE id = :5',
      [req.body.name, req.body.type, req.body.value, req.body.active ? 1 : 0, req.params.id]
    );
    const result = await query('SELECT * FROM discounts WHERE id = :1', [req.params.id]);
    if(result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteDiscount = async (req, res) => {
  try {
    const result = await query('SELECT * FROM discounts WHERE id = :1', [req.params.id]);
    if(result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    await query('DELETE FROM discounts WHERE id = :1', [req.params.id]);
    res.json({ message: 'Discount deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};