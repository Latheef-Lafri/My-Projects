/**
 * Local Tourist Day-Visit Planner and Information System
 * Database Initialization Script: scripts/init-db.js
 * Run using: npm run db:init
 * Author: Ahmed ALL (E2410186)
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  console.log('========================================================');
  console.log(' Local Tourist Day-Visit Planner - Database Initializer ');
  console.log('========================================================\n');

  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'tourist_planner_db';

  console.log(`[1/4] Connecting to MySQL server at ${host}:${port} as '${user}'...`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true
    });
    console.log('  -> Connected successfully to MySQL server.');
  } catch (err) {
    console.error('\n[ERROR] Failed to connect to MySQL server.');
    console.error(`Details: ${err.message}`);
    console.error('\nTroubleshooting tips:');
    console.error('1. Ensure your MySQL service (e.g., in XAMPP, WAMP, or MySQL Windows Service) is started.');
    console.error('2. Verify host, port, user, and password in your .env file.');
    console.error('3. Default XAMPP settings: host=127.0.0.1, port=3306, user=root, password=(empty).');
    process.exit(1);
  }

  try {
    console.log(`[2/4] Reading and executing schema.sql...`);
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    await connection.query(schemaSql);
    console.log(`  -> Database '${database}' and tables created successfully.`);

    console.log(`[3/4] Reading and applying seed.sql...`);
    const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    await connection.query(seedSql);
    console.log('  -> Categories, initial attractions, and default admin seeded successfully.');

    console.log(`[4/4] Verifying seeded records...`);
    await connection.changeUser({ database });

    const [catRows] = await connection.query('SELECT COUNT(*) as count FROM categories');
    const [placeRows] = await connection.query('SELECT COUNT(*) as count FROM tourist_places');
    const [adminRows] = await connection.query('SELECT COUNT(*) as count FROM admins');

    console.log(`  -> Categories count: ${catRows[0].count}`);
    console.log(`  -> Tourist Places count: ${placeRows[0].count}`);
    console.log(`  -> Administrators count: ${adminRows[0].count}`);

    console.log('\n========================================================');
    console.log(' Database initialization completed successfully!');
    console.log(' Default Admin: admin@touristplanner.local / admin123');
    console.log(' To create a new custom admin: npm run admin:create');
    console.log(' To start the server: npm start');
    console.log('========================================================\n');
  } catch (err) {
    console.error('\n[ERROR] An error occurred while executing SQL statements:');
    console.error(err.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
