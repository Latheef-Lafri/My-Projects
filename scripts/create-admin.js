/**
 * Local Tourist Day-Visit Planner and Information System
 * Administrator Creation Script: scripts/create-admin.js
 * Usage:
 *   node scripts/create-admin.js "Full Name" "email@domain.com" "password"
 *   OR run interactively: npm run admin:create
 * Author: Ahmed ALL (E2410186)
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const readline = require('readline');
const { query, testConnection } = require('../database/db');

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function createAdmin() {
  console.log('========================================================');
  console.log('     Create Administrator Account (Secure Bcrypt)       ');
  console.log('========================================================\n');

  let name = process.argv[2];
  let email = process.argv[3];
  let password = process.argv[4];

  if (!name) {
    name = await prompt('Enter Admin Full Name: ');
  }
  if (!email) {
    email = await prompt('Enter Admin Email Address: ');
  }
  if (!password) {
    password = await prompt('Enter Admin Password (min 6 characters): ');
  }

  if (!name || name.length < 2) {
    console.error('[ERROR] Name must be at least 2 characters long.');
    process.exit(1);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    console.error('[ERROR] Please enter a valid email address.');
    process.exit(1);
  }

  if (!password || password.length < 6) {
    console.error('[ERROR] Password must be at least 6 characters long.');
    process.exit(1);
  }

  try {
    console.log('\nChecking existing administrator records...');
    const existing = await query('SELECT admin_id FROM admins WHERE email = ?', [email.toLowerCase()]);
    if (existing.length > 0) {
      console.error(`[ERROR] An administrator with email "${email}" already exists.`);
      process.exit(1);
    }

    console.log('Hashing password with bcrypt (salt rounds: 10)...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    console.log('Saving administrator to database...');
    const result = await query(
      'INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email.toLowerCase(), passwordHash]
    );

    console.log('\n========================================================');
    console.log(' SUCCESS: Administrator created successfully!');
    console.log(` Admin ID: ${result.insertId || 'Generated'}`);
    console.log(` Name:     ${name}`);
    console.log(` Email:    ${email.toLowerCase()}`);
    console.log(' Password: [SECURELY HASHED - NEVER STORED IN PLAIN TEXT]');
    console.log('========================================================\n');
  } catch (err) {
    console.error('\n[ERROR] Failed to create administrator:');
    console.error(err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  createAdmin();
}

module.exports = { createAdmin };
