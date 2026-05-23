const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    const hashedPw = await bcrypt.hash('admin123', 10);
    
    // We already drop and create tables in init-db.js, so we can just INSERT
    // For users, we check if admin exists first
    const userRes = await db.query("SELECT id FROM users WHERE email = 'admin@example.com'");
    let adminId;
    if (userRes.rows.length === 0) {
        await db.query(`
            INSERT INTO users (name, email, password, role)
            VALUES (:1, :2, :3, :4)
        `, ['Admin User', 'admin@example.com', hashedPw, 'admin']);
        const newAdmin = await db.query("SELECT id FROM users WHERE email = 'admin@example.com'");
        adminId = newAdmin.rows[0].ID || newAdmin.rows[0].id;
    } else {
        adminId = userRes.rows[0].ID || userRes.rows[0].id;
        await db.query(`UPDATE users SET password = :1 WHERE id = :2`, [hashedPw, adminId]);
        console.log('🔄 Admin password reset to default (admin123)');
    }
    console.log(`✅ Admin user ready (id=${adminId})`);

    // 2. Customers
    const customers = [
      ['Alice Johnson', 'alice@email.com', '555-0101', '12 Oak Street, Springfield'],
      ['Bob Martinez', 'bob@email.com', '555-0102', '45 Pine Ave, Shelbyville'],
      ['Carol White', 'carol@email.com', '555-0103', '78 Maple Rd, Capital City']
    ];
    const custIds = [];
    for (const [name, email, phone, address] of customers) {
      await db.query(`INSERT INTO customers (name, email, phone, address) VALUES (:1,:2,:3,:4)`, [name, email, phone, address]);
      const res = await db.query('SELECT id FROM customers WHERE email = :1', [email]);
      custIds.push(res.rows[0].ID || res.rows[0].id);
    }
    console.log(`✅ ${custIds.length} customers ready`);

    // ... Simple seeding for others ...
    console.log('\n🎉 Basic database seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
