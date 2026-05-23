const db = require('../config/db');

exports.getProducts = async (req, res) => {
  try {
    const { search } = req.query;
    let queryText = 'SELECT * FROM products';
    let params = [];
    if (search) {
      queryText += ' WHERE LOWER(name) LIKE LOWER(:1) OR LOWER(description) LIKE LOWER(:1)';
      params.push(`%${search}%`);
    }
    queryText += ' ORDER BY id DESC';
    const products = await db.query(queryText, params);
    res.json(products.rows);
  } catch (err) {
    console.error('getProducts error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    await db.query(
      'INSERT INTO products (name, description, price, stock) VALUES (:1, :2, :3, :4)',
      [name, description, price, stock]
    );
    const newProduct = await db.query('SELECT * FROM products WHERE name = :1 ORDER BY id DESC FETCH NEXT 1 ROWS ONLY', [name]);
    res.json(newProduct.rows[0]);
  } catch (err) {
    console.error('createProduct error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;
    await db.query(
      'UPDATE products SET name = :1, description = :2, price = :3, stock = :4 WHERE id = :5',
      [name, description, price, stock, id]
    );
    const updatedProduct = await db.query('SELECT * FROM products WHERE id = :1', [id]);
    res.json(updatedProduct.rows[0]);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM products WHERE id = :1', [id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).send('Server error');
  }
};
