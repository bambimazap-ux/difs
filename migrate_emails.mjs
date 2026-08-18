import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:task-manager.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  try {
    const res = await db.execute('UPDATE users SET email = LOWER(TRIM(email))');
    console.log('Updated rows:', res.rowsAffected);
  } catch (err) {
    console.error('Error updating emails:', err.message);
  }
}

run();
