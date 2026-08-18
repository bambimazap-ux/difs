'use server';

import db from './db';
import bcrypt from 'bcryptjs';
import { createSession, deleteSession, getSession } from './auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const emailRaw = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  if (!emailRaw || !password) {
    return { error: 'נא להזין אימייל וסיסמה' };
  }
  const email = emailRaw.toLowerCase().trim();

  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email]
  });
  const user = result.rows[0] as any;

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: 'אימייל או סיסמה שגויים' };
  }

  if (!user.is_approved) {
    return { error: 'המשתמש שלך עדיין לא אושר על ידי מנהל המערכת.' };
  }

  await createSession(user.id as number, user.email as string, user.name as string);
  redirect('/');
}

export async function register(formData: FormData) {
  const name = formData.get('name') as string;
  const emailRaw = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !emailRaw || !password) {
    return { error: 'נא למלא את כל השדות' };
  }
  const email = emailRaw.toLowerCase().trim();

  const hashedPassword = await bcrypt.hash(password, 10);
  let newUserId: number;

  try {
    const result = await db.execute({
      sql: 'INSERT INTO users (name, email, password, is_approved) VALUES (?, ?, ?, 0)',
      args: [name, email, hashedPassword]
    });
    return { success: true, message: 'החשבון נוצר! אנא המתן לאישור מנהל.' };
  } catch (err: any) {
    if (err.message && (err.message.includes('UNIQUE') || err.message.includes('constraint'))) {
      return { error: 'משתמש עם אימייל זה כבר קיים' };
    }
    return { error: 'שגיאה ביצירת משתמש: ' + (err.message || '') };
  }
}

export async function createTeamMember(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: 'לא מורשה' };

  const name = formData.get('name') as string;
  const emailRaw = formData.get('email') as string;
  const password = (formData.get('password') as string) || '123456';

  if (!name || !emailRaw) {
    return { error: 'חובה למלא שם ומייל' };
  }
  const email = emailRaw.toLowerCase().trim();

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.execute({
      sql: 'INSERT INTO users (name, email, password, is_approved) VALUES (?, ?, ?, 1)',
      args: [name, email, hashedPassword]
    });
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    if (err.message && (err.message.includes('UNIQUE') || err.message.includes('constraint'))) {
      return { error: 'חבר צוות עם אימייל זה כבר קיים' };
    }
    return { error: 'שגיאה בהוספת חבר צוות' };
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
  let topicId = formData.get('topicId') as string;
  const newTopicTitle = formData.get('newTopicTitle') as string;
  const userId = formData.get('userId') as string;
  const driveLink = formData.get('driveLink') as string;
  const priority = (formData.get('priority') as string) || 'MEDIUM';
  const dueDate = (formData.get('dueDate') as string) || null;
  const status = (formData.get('status') as string) || 'TODO';
  
  if (!title) return { error: 'חובה למלא שם משימה' };

  if (topicId === 'NEW_TOPIC' && newTopicTitle) {
    const res = await db.execute({
      sql: 'INSERT INTO topics (title) VALUES (?)',
      args: [newTopicTitle]
    });
    topicId = res.lastInsertRowid!.toString();
  } else if (!topicId) {
    return { error: 'חובה לבחור נושא' };
  }

  const res = await db.execute({
    sql: 'INSERT INTO tasks (title, topic_id, user_id, drive_link, priority, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [title, topicId, userId || null, driveLink || null, priority, dueDate, status]
  });
  
  const taskId = res.lastInsertRowid!.toString();
  const session = await getSession();
  
  await db.execute({
    sql: 'INSERT INTO audit_logs (task_id, user_id, action, new_value) VALUES (?, ?, ?, ?)',
    args: [taskId, (session?.userId as any) || null, 'CREATED', title]
  });
  
  revalidatePath('/');
}

export async function updateTaskStatus(id: number, status: string) {
  const session = await getSession();
  const oldTaskRes = await db.execute({ sql: 'SELECT status FROM tasks WHERE id = ?', args: [id] });
  const oldStatus = oldTaskRes.rows[0]?.status as string;

  await db.execute({
    sql: 'UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    args: [status, id]
  });
  
  if (oldStatus !== status) {
    await db.execute({
      sql: 'INSERT INTO audit_logs (task_id, user_id, action, old_value, new_value) VALUES (?, ?, ?, ?, ?)',
      args: [id, (session?.userId as any) || null, 'STATUS_CHANGED', oldStatus, status]
    });
  }
  
  revalidatePath('/');
}

export async function updateTask(id: number, formData: FormData) {
  const session = await getSession();
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const driveLink = formData.get('driveLink') as string;
  const topicId = formData.get('topicId') as string;
  const userId = formData.get('userId') as string;
  const priority = (formData.get('priority') as string) || 'MEDIUM';
  const dueDate = (formData.get('dueDate') as string) || null;
  const progressLog = (formData.get('progressLog') as string) || null;

  if (!title || !topicId) return { error: 'חובה למלא שם משימה ונושא' };

  await db.execute({
    sql: 'UPDATE tasks SET title = ?, description = ?, drive_link = ?, priority = ?, due_date = ?, progress_log = ?, topic_id = ?, user_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    args: [title, description || null, driveLink || null, priority, dueDate, progressLog, topicId, userId || null, id]
  });
  
  await db.execute({
    sql: 'INSERT INTO audit_logs (task_id, user_id, action, new_value) VALUES (?, ?, ?, ?)',
    args: [id, (session?.userId as any) || null, 'UPDATED', 'פרטי משימה עודכנו']
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
  const result = await db.execute('SELECT id, name, email, is_approved FROM users');
  return result.rows;
}

export async function approveUser(userId: number) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  
  await db.execute({
    sql: 'UPDATE users SET is_approved = 1 WHERE id = ?',
    args: [userId]
  });
  revalidatePath('/');
}

export async function rejectUser(userId: number) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  await db.execute({
    sql: 'DELETE FROM users WHERE id = ?',
    args: [userId]
  });
  revalidatePath('/');
}

export async function revokeUserAccess(userId: number) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  if (session.userId === userId) throw new Error('You cannot revoke your own access');

  await db.execute({
    sql: 'UPDATE users SET is_approved = 0 WHERE id = ?',
    args: [userId]
  });
  revalidatePath('/');
}

// Subtasks
export async function getSubtasks() {
  const result = await db.execute('SELECT * FROM subtasks ORDER BY created_at ASC');
  return result.rows;
}

export async function createSubtask(taskId: number, title: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  await db.execute({
    sql: 'INSERT INTO subtasks (task_id, title) VALUES (?, ?)',
    args: [taskId, title]
  });
  revalidatePath('/');
}

export async function updateSubtaskStatus(subtaskId: number, status: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  await db.execute({
    sql: "UPDATE subtasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    args: [status, subtaskId]
  });
  revalidatePath('/');
}

export async function deleteSubtask(subtaskId: number) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  await db.execute({
    sql: 'DELETE FROM subtasks WHERE id = ?',
    args: [subtaskId]
  });
  revalidatePath('/');
}

export async function getTaskAuditLogs(taskId: number) {
  const result = await db.execute({
    sql: "SELECT a.*, u.name as user_name FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id WHERE a.task_id = ? ORDER BY a.created_at DESC",
    args: [taskId]
  });
  return result.rows;
}
