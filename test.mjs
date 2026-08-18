import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';


const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  const email = `test-${Date.now()}@example.com`;
  console.log('Testing register for', email);
  try {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const res = await db.execute({
      sql: 'INSERT INTO users (name, email, password, is_approved) VALUES (?, ?, ?, 0)',
      args: ['Test', email, hashedPassword]
    });
    console.log('Register success:', res);
  } catch (err) {
    console.error('Register failed:', err.message);
  }

  console.log('Testing duplicate register for', email);
  try {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const res = await db.execute({
      sql: 'INSERT INTO users (name, email, password, is_approved) VALUES (?, ?, ?, 0)',
      args: ['Test', email, hashedPassword]
    });
    console.log('Duplicate Register success?!:', res);
  } catch (err) {
    console.error('Duplicate Register failed (Expected):', err.message);
  }

  // Testing login
  console.log('Testing login for', email);
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email]
  });
  const user = result.rows[0];
  console.log('User found:', !!user);
  if (user) {
    console.log('is_approved field:', user.is_approved);
    if (!user.is_approved) {
      console.log('Login blocked by is_approved check (Expected).');
    }
  }
}

run();
