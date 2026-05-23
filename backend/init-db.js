const fs = require('fs');
const path = require('path');
const { query, initializePool } = require('./config/db');

const schemaPath = path.join(__dirname, 'schema.sql');

const tables = [
  'inventory_transactions',
  'discounts',
  'payments',
  'invoices',
  'purchase_items',
  'purchase_orders',
  'sale_items',
  'sales',
  'products',
  'customers',
  'users',
  'suppliers'
];

async function dropTables() {
  for (const table of tables) {
    try {
      console.log(`Dropping table ${table}...`);
      await query(`DROP TABLE ${table} CASCADE CONSTRAINTS`);
    } catch (err) {
      // Ignore if table does not exist (ORA-00942)
      if (err.message && err.message.includes('ORA-00942')) {
        continue;
      }
      console.error(`Error dropping table ${table}:`, err.message);
    }
  }
}

async function run() {
  try {
    await initializePool();
    
    await dropTables();

    const rawSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by '/' which is standard for Oracle PL/SQL blocks in scripts
    // Also handle regular semicolon-terminated statements
    const statements = rawSql.split(/\n\s*\/\s*\n|\n\s*\/\s*$/).filter(s => s.trim().length > 0);
    
    for (let rawStatement of statements) {
      // Each block might contain multiple semicolon-terminated standard SQL statements
      // but triggers/procedures themselves contain semicolons, so we execute the whole block
      const statement = rawStatement.trim();
      if (!statement) continue;

      // If the statement doesn't look like a PL/SQL block (doesn't have BEGIN/CREATE OR REPLACE), 
      // we might need to split it further by semicolons if multiple standard statements are in one slice.
      // However, usually each slice in a '/' delimited file is one logical unit.
      
      console.log(`Executing SQL: ${statement.substring(0, 50)}...`);
      try {
        // Remove trailing semicolon for standard SQL (not PL/SQL)
        let execStatement = statement;
        const cleanStatement = statement.replace(/--.*$/gm, '').trim();
        const isPLSQL = /^\s*(CREATE|ALTER|DECLARE|BEGIN|DROP)\s+(OR\s+REPLACE\s+)?(TRIGGER|PROCEDURE|FUNCTION|PACKAGE|TYPE|LIBRARY)/i.test(cleanStatement) || /^\s*(BEGIN|DECLARE)/i.test(cleanStatement);
        
        if (!isPLSQL && execStatement.endsWith(';')) {
          execStatement = execStatement.slice(0, -1).trim();
        }
        
        await query(execStatement);
      } catch (err) {
        console.error(`Error executing statement:`, err.message);
        throw err;
      }
    }

    console.log('Database schema created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error executing schema:', err);
    process.exit(1);
  }
}

run();