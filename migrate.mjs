import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:task-manager.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  try {
    await db.execute('ALTER TABLE users ADD COLUMN is_approved BOOLEAN DEFAULT 1');
    console.log('Column is_approved added.');
  } catch (err) {
    console.log('Error or column already exists:', err.message);
  }
}

run();
