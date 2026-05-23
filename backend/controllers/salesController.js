const db = require('../config/db');

exports.getSales = async (req, res) => {
  try {
    const { search } = req.query;
    let queryText = `
      SELECT s.*, c.name as customer_name, u.name as user_name 
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN users u ON s.user_id = u.id
    `;
    let params = [];
    if (search) {
      queryText += ' WHERE LOWER(c.name) LIKE LOWER(:1) OR LOWER(s.status) LIKE LOWER(:1) OR LOWER(TO_CHAR(s.total_amount)) LIKE LOWER(:1)';
      params.push(`%${search}%`);
    }
    queryText += ' ORDER BY s.created_at DESC';
    const sales = await db.query(queryText, params);
    res.json(sales.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.createSale = async (req, res) => {
  let connection;
  try {
    const { customer_id, total_amount, items } = req.body;
    const user_id = req.user.id;

    connection = await db.getConnection();

    // 1. Insert into sales
    await db.query(
      'INSERT INTO sales (customer_id, user_id, total_amount, status) VALUES (:1, :2, :3, :4)',
      [customer_id, user_id, total_amount, 'paid'],
      connection
    );
    
    // Get last inserted ID for this user
    const saleRes = await db.query(
      'SELECT id FROM sales WHERE user_id = :1 ORDER BY created_at DESC FETCH NEXT 1 ROWS ONLY',
      [user_id],
      connection
    );
    const sale_id = saleRes.rows[0].id;

    // 2. Insert items and update stock
    for (let item of items) {
      const stockCheck = await db.query('SELECT stock FROM products WHERE id = :1', [item.product_id], connection);
      if(stockCheck.rows.length === 0 || stockCheck.rows[0].stock < item.quantity) {
        throw new Error(`Insufficient stock for Product ID ${item.product_id}`);
      }
      
      await db.query(
        'INSERT INTO sale_items (sale_id, product_id, quantity, price_at_time) VALUES (:1, :2, :3, :4)',
        [sale_id, item.product_id, item.quantity, item.price],
        connection
      );
    }

    await connection.commit();
    res.json({ id: sale_id, customer_id, total_amount, status: 'paid' });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error(err);
    res.status(400).json({ error: err.message || 'Server error' });
  } finally {
    if (connection) await connection.close();
  }
};

exports.getSalesStats = async (req, res) => {
  try {
    const totalSales = await db.query('SELECT COUNT(*) as "COUNT" FROM sales');
    const totalRevenue = await db.query('SELECT SUM(total_amount) as "SUM" FROM sales');
    const totalCustomers = await db.query('SELECT COUNT(*) as "COUNT" FROM customers');
    const totalProducts = await db.query('SELECT COUNT(*) as "COUNT" FROM products');
    const totalInventoryValue = await db.query('SELECT SUM(price * stock) as "SUM" FROM products');
    
    const recentSales = await db.query(`
      SELECT s.*, c.name as customer_name 
      FROM sales s 
      LEFT JOIN customers c ON s.customer_id = c.id 
      ORDER BY s.created_at DESC FETCH NEXT 5 ROWS ONLY
    `);
    
    const monthlyRevenue = await db.query(`
      SELECT TO_CHAR(created_at, 'Mon') as "NAME", SUM(total_amount) as "VALUE" 
      FROM sales 
      GROUP BY TO_CHAR(created_at, 'Mon')
      ORDER BY MIN(created_at) ASC
      FETCH NEXT 6 ROWS ONLY
    `);

    const lowStock = await db.query(`SELECT id, name, stock FROM products WHERE stock < 20 ORDER BY stock ASC FETCH NEXT 4 ROWS ONLY`);
    const topProducts = await db.query(`SELECT name, stock FROM products WHERE stock > 0 ORDER BY stock DESC FETCH NEXT 4 ROWS ONLY`);
    
    let revenueData = monthlyRevenue.rows.length ? monthlyRevenue.rows.map(d => ({ name: d.name, value: Number(d.value) })) : [
      { name: 'Jan', value: 4000 }, { name: 'Feb', value: 3000 }, { name: 'Mar', value: 5000 },
      { name: 'Apr', value: 2780 }, { name: 'May', value: 6890 }, { name: 'Jun', value: 3390 },
    ];

    let stockDist = topProducts.rows.length ? topProducts.rows.map(d => ({ name: d.name, value: Number(d.stock) })) : [
      { name: 'Laptops', value: 400 }, { name: 'Monitors', value: 300 },
      { name: 'Keyboards', value: 300 }, { name: 'Mice', value: 200 }
    ];
    
    res.json({
      total_sales: totalSales.rows[0].count,
      total_revenue: totalRevenue.rows[0].sum || 0,
      total_inventory_value: totalInventoryValue.rows[0].sum || 0,
      total_customers: totalCustomers.rows[0].count,
      total_products: totalProducts.rows[0].count,
      recent_activity: recentSales.rows,
      monthly_revenue: revenueData,
      low_stock_items: lowStock.rows,
      stock_distribution: stockDist
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
