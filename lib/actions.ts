'use server';

import db from './db';
import bcrypt from 'bcryptjs';
import { createSession, deleteSession, getSession } from './auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'נא להזין אימייל וסיסמה' };
  }

  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email]
  });
  const user = result.rows[0] as any;

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: 'אימייל או סיסמה שגויים' };
  }

  await createSession(user.id as number, user.email as string, user.name as string);
  redirect('/');
}

export async function register(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { error: 'נא למלא את כל השדות' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await db.execute({
      sql: 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      args: [name, email, hashedPassword]
    });
    await createSession(Number(result.lastInsertRowid), email, name);
    redirect('/');
  } catch (err: any) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return { error: 'משתמש עם אימייל זה כבר קיים' };
    }
    return { error: 'שגיאה ביצירת משתמש' };
  }
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}

// --- Topic Actions ---
export async function getTopics() {
  const result = await db.execute('SELECT * FROM topics ORDER BY created_at DESC');
  return result.rows;
}

export async function createTopic(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  if (!title) return { error: 'נא להזין שם נושא' };

  await db.execute({
    sql: 'INSERT INTO topics (title, description) VALUES (?, ?)',
    args: [title, description || null]
  });
  revalidatePath('/');
}

export async function deleteTopic(id: number) {
  await db.execute({
    sql: 'DELETE FROM topics WHERE id = ?',
    args: [id]
  });
  revalidatePath('/');
}

// --- Task Actions ---
export async function getTasks() {
  const result = await db.execute(`
    SELECT tasks.*, topics.title as topic_title, users.name as user_name 
    FROM tasks 
    LEFT JOIN topics ON tasks.topic_id = topics.id
    LEFT JOIN users ON tasks.user_id = users.id
    ORDER BY tasks.created_at DESC
  `);
  return result.rows;
}

export async function getTasksByTopic(topicId: number) {
  const result = await db.execute({
    sql: `
      SELECT tasks.*, users.name as user_name 
      FROM tasks 
      LEFT JOIN users ON tasks.user_id = users.id
      WHERE topic_id = ?
      ORDER BY tasks.created_at DESC
    `,
    args: [topicId]
  });
  return result.rows;
}

export async function createTask(formData: FormData) {
  const title = formData.get('title') as string;
  const topicId = formData.get('topicId') as string;
  const userId = formData.get('userId') as string;
  const driveLink = formData.get('driveLink') as string;
  const status = formData.get('status') as string || 'TODO';
  
  if (!title || !topicId) return { error: 'חובה למלא שם משימה ונושא' };

  await db.execute({
    sql: 'INSERT INTO tasks (title, topic_id, user_id, drive_link, status) VALUES (?, ?, ?, ?, ?)',
    args: [title, topicId, userId || null, driveLink || null, status]
  });
  revalidatePath('/');
}

export async function updateTaskStatus(id: number, status: string) {
  await db.execute({
    sql: 'UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    args: [status, id]
  });
  revalidatePath('/');
}

export async function updateTask(id: number, formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const driveLink = formData.get('driveLink') as string;
  const topicId = formData.get('topicId') as string;
  const userId = formData.get('userId') as string;

  if (!title || !topicId) return { error: 'חובה למלא שם משימה ונושא' };

  await db.execute({
    sql: 'UPDATE tasks SET title = ?, description = ?, drive_link = ?, topic_id = ?, user_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    args: [title, description || null, driveLink || null, topicId, userId || null, id]
  });
  revalidatePath('/');
}

export async function deleteTask(id: number) {
  await db.execute({
    sql: 'DELETE FROM tasks WHERE id = ?',
    args: [id]
  });
  revalidatePath('/');
}

export async function getUsers() {
  const result = await db.execute('SELECT id, name, email FROM users');
  return result.rows;
}
