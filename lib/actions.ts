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

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: 'אימייל או סיסמה שגויים' };
  }

  await createSession(user.id, user.email, user.name);
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
    const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hashedPassword);
    await createSession(result.lastInsertRowid as number, email, name);
    redirect('/');
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
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
  return db.prepare('SELECT * FROM topics ORDER BY created_at DESC').all();
}

export async function createTopic(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  if (!title) return { error: 'נא להזין שם נושא' };

  db.prepare('INSERT INTO topics (title, description) VALUES (?, ?)').run(title, description);
  revalidatePath('/');
}

export async function deleteTopic(id: number) {
  db.prepare('DELETE FROM topics WHERE id = ?').run(id);
  revalidatePath('/');
}

// --- Task Actions ---
export async function getTasks() {
  return db.prepare(`
    SELECT tasks.*, topics.title as topic_title, users.name as user_name 
    FROM tasks 
    LEFT JOIN topics ON tasks.topic_id = topics.id
    LEFT JOIN users ON tasks.user_id = users.id
    ORDER BY tasks.created_at DESC
  `).all();
}

export async function getTasksByTopic(topicId: number) {
  return db.prepare(`
    SELECT tasks.*, users.name as user_name 
    FROM tasks 
    LEFT JOIN users ON tasks.user_id = users.id
    WHERE topic_id = ?
    ORDER BY tasks.created_at DESC
  `).all(topicId);
}

export async function createTask(formData: FormData) {
  const title = formData.get('title') as string;
  const topicId = formData.get('topicId') as string;
  const userId = formData.get('userId') as string;
  const driveLink = formData.get('driveLink') as string;
  const status = formData.get('status') as string || 'TODO';
  
  if (!title || !topicId) return { error: 'חובה למלא שם משימה ונושא' };

  db.prepare('INSERT INTO tasks (title, topic_id, user_id, drive_link, status) VALUES (?, ?, ?, ?, ?)').run(
    title, topicId, userId || null, driveLink || null, status
  );
  revalidatePath('/');
}

export async function updateTaskStatus(id: number, status: string) {
  db.prepare('UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
  revalidatePath('/');
}

export async function updateTask(id: number, formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const driveLink = formData.get('driveLink') as string;
  const topicId = formData.get('topicId') as string;
  const userId = formData.get('userId') as string;

  if (!title || !topicId) return { error: 'חובה למלא שם משימה ונושא' };

  db.prepare('UPDATE tasks SET title = ?, description = ?, drive_link = ?, topic_id = ?, user_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
    title, description || null, driveLink || null, topicId, userId || null, id
  );
  revalidatePath('/');
}

export async function deleteTask(id: number) {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  revalidatePath('/');
}

export async function getUsers() {
  return db.prepare('SELECT id, name, email FROM users').all();
}
