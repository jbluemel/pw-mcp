import { pool } from './connection.js';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful!');
    console.log('Current time from database:', result.rows[0].now);
    
    // Test itembasics table exists
    const tableCheck = await pool.query(`
      SELECT COUNT(*) as count 
      FROM itemsbasics
    `);
    console.log(`✓ Found ${tableCheck.rows[0].count} items in itembasics table`);
    
    await pool.end();
    console.log('✓ Test complete!');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
