const oracledb = require('oracledb');
const dotenv = require('dotenv');

dotenv.config();

// Default autoCommit to true for simple queries
oracledb.autoCommit = true;
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.fetchAsString = [oracledb.CLOB];


let pool;

const initializePool = async () => {
  if (pool) return pool;
  try {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectionString: process.env.DB_CONNECTION_STRING,
      poolMin: 1,
      poolMax: 10,
      poolIncrement: 1
    });
    console.log('Connected to Oracle Database Pool');
    return pool;
  } catch (err) {
    console.error('Error creating Oracle pool:', err);
    throw err;
  }
};

const query = async (text, params = [], connectionOverride = null) => {
  if (!pool) {
    await initializePool();
  }
  let connection = connectionOverride;
  const shouldClose = !connectionOverride;
  try {
    if (!connection) {
      connection = await pool.getConnection();
    }
    
    const trimmedText = text.trim().toUpperCase();
    const isPLSQL = trimmedText.startsWith('BEGIN') || trimmedText.startsWith('DECLARE');
    
    // Convert $1, $2 placeholders to :1, :2 for compatibility during transition
    let oracleText = isPLSQL ? text : text.replace(/\$(\d+)/g, ':$1');
    
    // Convert ILIKE to LOWER(...) LIKE LOWER(...)
    if (!isPLSQL) {
      // Handle "col ILIKE :1" or "table.col ILIKE :1"
      oracleText = oracleText.replace(/([\w\.]+)\s+ILIKE\s+:(\d+)/gi, 'LOWER($1) LIKE LOWER(:$2)');
    }
    
    // Check if the query is a transaction control command (like COMMIT, ROLLBACK)
    if (trimmedText === 'COMMIT') {
      await connection.commit();
      return { rows: [] };
    }
    if (trimmedText === 'ROLLBACK') {
      await connection.rollback();
      return { rows: [] };
    }

    const executeOptions = connectionOverride ? { autoCommit: false } : {};
    const result = await connection.execute(oracleText, params, executeOptions);
    
    // Convert keys to lowercase for compatibility with pg-style code
    const rows = (result.rows || []).map(row => {
      const lowerRow = {};
      for (const key in row) {
        lowerRow[key.toLowerCase()] = row[key];
      }
      return lowerRow;
    });
    
    // Return structure similar to 'pg': { rows: [...] }
    return {
      rows: rows,
      rowCount: result.rows ? result.rows.length : result.rowsAffected,
      lastRowid: result.lastRowid
    };
  } catch (err) {
    console.error('Oracle Query Error:', err);
    throw err;
  } finally {
    if (connection && shouldClose) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
};

const getConnection = async () => {
  if (!pool) {
    await initializePool();
  }
  return await pool.getConnection();
};

module.exports = {
  query,
  initializePool,
  getConnection,
  getPool: () => pool
};
