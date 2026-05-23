const db = require('./backend/config/db');

async function testTriggers() {
  try {
    await db.initializePool();
    
    // 1. Check initial stock of a product
    const product = await db.query('SELECT stock FROM products WHERE id = 1');
    if (product.rows.length === 0) {
        // Seed first
        console.log('No products found, please run seed.js first');
        process.exit(1);
    }
    const initialStock = Number(product.rows[0].stock);
    console.log(`Initial Stock for Product 1: ${initialStock}`);

    // 2. Simulate a sale item insertion
    console.log('Simulating a sale of 5 items...');
    // We need a dummy sale first
    await db.query('INSERT INTO sales (customer_id, user_id, total_amount, status) VALUES (1, 1, 100, "paid")');
    const saleRes = await db.query('SELECT id FROM sales ORDER BY id DESC FETCH NEXT 1 ROWS ONLY');
    const saleId = saleRes.rows[0].id;
    
    await db.query('INSERT INTO sale_items (sale_id, product_id, quantity, price_at_time) VALUES (:1, 1, 5, 20)', [saleId]);

    // 3. Check stock again
    const updatedProduct = await db.query('SELECT stock FROM products WHERE id = 1');
    const newStock = Number(updatedProduct.rows[0].stock);
    console.log(`Updated Stock for Product 1: ${newStock}`);

    if (newStock === initialStock - 5) {
      console.log('✅ Trigger test passed: Stock reduced by 5');
    } else {
      console.error('❌ Trigger test failed: Stock was not updated correctly');
    }

    // 4. Test Inventory Trigger
    console.log('Testing Inventory Trigger (Adding 10 items)...');
    await db.query('INSERT INTO inventory_transactions (product_id, transaction_type, quantity, notes) VALUES (1, "IN", 10, "Restock test")');
    
    const finalProduct = await db.query('SELECT stock FROM products WHERE id = 1');
    const finalStock = Number(finalProduct.rows[0].stock);
    console.log(`Final Stock after Inventory IN: ${finalStock}`);
    
    if (finalStock === newStock + 10) {
      console.log('✅ Inventory Trigger test passed: Stock increased by 10');
    } else {
      console.error('❌ Inventory Trigger test failed');
    }

    process.exit(0);
  } catch (err) {
    console.error('Verification error:', err.message);
    process.exit(1);
  }
}

testTriggers();
