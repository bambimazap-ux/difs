import re

with open('app/components/TaskCard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add status to edit form
pattern1 = r'(<select name="priority"[^>]*>.*?<\/select>)'
replacement1 = r'''\1
            <select name="status" defaultValue={task.status || 'TODO'}>
              <option value="TODO">סטטוס: לביצוע</option>
              <option value="IN_PROGRESS">סטטוס: בתהליך</option>
              <option value="DONE">סטטוס: הושלם</option>
              <option value="STUCK">סטטוס: תקוע</option>
            </select>'''

content = re.sub(pattern1, replacement1, content, count=1, flags=re.DOTALL)

# Add Trash2 to imports
pattern2 = r'import { (.*?) } from \'lucide-react\';'
replacement2 = r'import { \1, Trash2 } from \'lucide-react\';'
content = re.sub(pattern2, replacement2, content, count=1)

# Add delete button to expanded view
pattern3 = r'(<button type="button" className="btn btn-outline"[^>]*onClick={\(e\) => { e\.stopPropagation\(\); setEditingTaskId\(task\.id\); }}.*?<\/button>)'
replacement3 = r'''\1
            <button type="button" className="btn btn-outline" style={{ padding: '6px 12px', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }} onClick={async (e) => { 
              e.stopPropagation(); 
              if (confirm('האם אתה בטוח שברצונך למחוק משימה זו?')) {
                await deleteTask(task.id);
              }
            }}>
              <Trash2 size={16} /> מחק
            </button>'''

content = re.sub(pattern3, replacement3, content, count=1, flags=re.DOTALL)

# Import deleteTask
pattern4 = r'import { updateTask, updateTaskStatus, addSubtask, toggleSubtask } from \'@/lib/actions\';'
replacement4 = r'import { updateTask, updateTaskStatus, addSubtask, toggleSubtask, deleteTask } from \'@/lib/actions\';'
content = content.replace(pattern4, replacement4)

with open('app/components/TaskCard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated TaskCard.tsx successfully')
