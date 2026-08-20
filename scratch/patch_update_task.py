import re

with open('lib/actions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r"(const dueDate = \(formData\.get\('dueDate'\) as string\) \|\| null;\s*const progressLog = \(formData\.get\('progressLog'\) as string\) \|\| null;.*?sql: 'UPDATE tasks SET title = \?, description = \?, drive_link = \?, priority = \?, due_date = \?, progress_log = \?, topic_id = \?, user_id = \?, updated_at = CURRENT_TIMESTAMP WHERE id = \?',\s*args: \[title, description \|\| null, driveLink \|\| null, priority, dueDate, progressLog, topicId, userId \|\| null, id\])"

replacement = r'''const dueDate = (formData.get('dueDate') as string) || null;
  const progressLog = (formData.get('progressLog') as string) || null;
  const status = (formData.get('status') as string) || 'TODO';

  if (!title || !topicId) return { error: 'חסרים שדות חובה' };

  await db.execute({
    sql: 'UPDATE tasks SET title = ?, description = ?, drive_link = ?, priority = ?, due_date = ?, progress_log = ?, topic_id = ?, user_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    args: [title, description || null, driveLink || null, priority, dueDate, progressLog, topicId, userId || null, status, id]'''

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('lib/actions.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated updateTask with status successfully')
