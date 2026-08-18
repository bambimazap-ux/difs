const fs = require('fs');
let content = fs.readFileSync('app/DashboardClient.tsx', 'utf8');

// 1. Rewrite renderTask for click-to-edit and minimal mode
const searchRenderTask = '  const renderTask = (task: any) => (';
const renderTaskContentEnd = '  );\\n\\n  return (';
const renderTaskIdxStart = content.indexOf(searchRenderTask);
const renderTaskIdxEnd = content.indexOf(renderTaskContentEnd) + renderTaskContentEnd.length - 12; // before 'return ('

const oldRenderTaskBlock = content.substring(renderTaskIdxStart, renderTaskIdxEnd);

const newRenderTaskBlock = \  const renderTask = (task: any) => (
    editingTaskId === task.id ? (
      <div key={task.id} id={\\\	ask-\\\\} className="task-card" style={{ marginBottom: '16px', border: '1px solid var(--primary-color)', flexWrap: 'wrap', backgroundColor: '#f8f9fa' }}>
        <form action={async (formData) => {
          await updateTask(task.id, formData);
          setEditingTaskId(null);
        }} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="text" name="title" defaultValue={task.title} required placeholder="תיאור המשימה..." />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
            <select name="topicId" required defaultValue={task.topic_id}>
              <option value="" disabled>בחר נושא</option>
              {initialTopics.map((t: any) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
            
            <select name="userId" defaultValue={task.user_id || ''}>
              <option value="">ללא שיוך</option>
              {approvedUsers.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>

            <select name="priority" defaultValue={task.priority || 'MEDIUM'}>
              <option value="HIGH">?? עדיפות: דחוף</option>
              <option value="MEDIUM">?? עדיפות: רגיל</option>
              <option value="LOW">? עדיפות: נמוך</option>
            </select>

            <input type="date" name="dueDate" defaultValue={task.due_date || ''} />
          </div>

          <textarea name="description" placeholder="הערות או תיאור מורחב..." defaultValue={task.description} rows={2}></textarea>
          <textarea name="progressLog" placeholder="הערת סטטוס והתקדמות שוטפת (לדוגמה: 16/08 בוצעו 4 ראיונות מתוך 10)..." defaultValue={task.progress_log} rows={2}></textarea>
          <input type="url" name="driveLink" defaultValue={task.drive_link} placeholder="קישור לדרייב (אופציונלי)" />

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>סטטוס משימה:</span>
            <select 
              name="status"
              defaultValue={task.status} 
              style={{ width: 'auto', padding: '4px 8px', fontSize: '13px', height: '32px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            >
              <option value="TODO">לביצוע</option>
              <option value="IN_PROGRESS">בתהליך</option>
              <option value="DONE">בוצע</option>
              <option value="STUCK">תקוע</option>
            </select>
            {task.drive_link && (
              <button 
                type="button"
                onClick={() => window.open(task.drive_link, '_blank')}
                title="פתיחת קבצים ב-Drive"
                style={{ background: 'none', border: 'none', color: '#1fa463', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: 'auto' }}
              >
                <Link size={16} /> פתח דרייב
              </button>
            )}
            <button 
              type="button"
              onClick={() => {
                const text = \משימה: \\\nנושא: \\\nאחראי: \\\nעדיפות: \\\\\n\\nלצפייה במשימה: https://difs.vercel.app/\;
                window.open(\https://wa.me/?text=\\, '_blank');
              }}
              title="שתף ב-WhatsApp"
              style={{ background: 'none', border: 'none', color: '#25D366', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '8px' }}
            >
              <MessageCircle size={16} />
            </button>
            <button 
              type="button"
              onClick={() => { if(confirm('למחוק משימה זו?')) deleteTask(task.id) }} 
              style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', marginLeft: '8px', fontSize: '13px' }}
            >
              מחק
            </button>
          </div>

          <div style={{ marginTop: '12px', borderTop: '1px solid #ddd', paddingTop: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>תתי-משימות (צ'קליסט)</div>
            {initialSubtasks
              .filter((st: any) => st.task_id === task.id)
              .map((st: any) => (
                <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                  <div style={{ cursor: 'pointer', color: st.status === 'DONE' ? 'var(--success-color)' : 'var(--text-secondary)' }} onClick={() => updateSubtaskStatus(st.id, st.status === 'DONE' ? 'TODO' : 'DONE')}>
                    {st.status === 'DONE' ? <CheckSquare size={16} /> : <Square size={16} />}
                  </div>
                  <div style={{ fontSize: '13px', flex: 1, textDecoration: st.status === 'DONE' ? 'line-through' : 'none', color: st.status === 'DONE' ? 'var(--text-secondary)' : 'inherit' }}>
                    {st.title}
                  </div>
                  <button type="button" onClick={() => { if(confirm('למחוק תת-משימה זו?')) deleteSubtask(st.id) }} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '12px' }}>
                    מחק
                  </button>
                </div>
              ))}
              
            {addingSubtaskToTaskId === task.id ? (
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <input type="text" id={\subtask-input-\\} autoFocus placeholder="תיאור תת-משימה..." style={{ flex: 1, padding: '4px 8px', fontSize: '13px', height: '28px' }} />
                <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '12px', height: '28px' }} onClick={async () => {
                  const input = document.getElementById(\subtask-input-\\) as HTMLInputElement;
                  if (input && input.value) {
                    await createSubtask(task.id, input.value);
                    input.value = '';
                  }
                  setAddingSubtaskToTaskId(null);
                }}>שמור צ'קליסט</button>
                <button type="button" className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '12px', height: '28px' }} onClick={() => setAddingSubtaskToTaskId(null)}>ביטול</button>
              </div>
            ) : (
              <div style={{ marginTop: '8px' }}>
                <button type="button" onClick={() => setAddingSubtaskToTaskId(task.id)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={14} /> הוסף פריט לצ'קליסט
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setEditingTaskId(null)}>סגור עריכה</button>
            <button type="submit" className="btn">שמור שינויים</button>
          </div>
        </form>
      </div>
    ) : (
      <div 
        key={task.id} 
        id={\	ask-\\} 
        className="task-card"
        style={{ cursor: 'pointer', alignItems: 'center', padding: '12px 16px', opacity: task.status === 'DONE' ? 0.75 : 1 }}
        onClick={(e) => {
          // If clicked on status icon, don't open edit mode
          if ((e.target as HTMLElement).closest('.status-toggle-btn')) return;
          setEditingTaskId(task.id);
        }}
      >
        <div 
          className="status-toggle-btn"
          style={{ cursor: 'pointer', marginRight: '12px', display: 'flex', alignItems: 'center' }} 
          onClick={(e) => {
            e.stopPropagation();
            updateTaskStatus(task.id, task.status === 'DONE' ? 'TODO' : 'DONE');
          }}
        >
          {getStatusIcon(task.status)}
        </div>
        
        <div className="task-content" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="task-title" style={{ margin: 0, textDecoration: task.status === 'DONE' ? 'line-through' : 'none', color: task.status === 'DONE' ? 'var(--text-secondary)' : 'inherit', fontSize: '15px' }}>
              {task.title}
            </div>
          </div>
          <div className="task-meta" style={{ marginTop: '4px', fontSize: '12px' }}>
            <span style={{ color: 'var(--primary-color)', fontWeight: 500 }}>{task.topic_title}</span>
            <span>•</span>
            <span>{task.user_name || 'לא שויך'}</span>
            <span>•</span>
            {getPriorityBadge(task.priority)}
            {task.progress_log && (
               <span style={{ marginLeft: '8px', color: '#666' }}>({task.progress_log})</span>
            )}
          </div>
        </div>
        <ChevronDown size={18} color="var(--text-secondary)" style={{ marginLeft: '8px' }} />
      </div>
    )
  );\
content = content.replace(oldRenderTaskBlock, newRenderTaskBlock);
fs.writeFileSync('app/DashboardClient.tsx', content);
console.log('Phase 2 done');
