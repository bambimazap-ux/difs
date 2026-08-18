import { useState } from 'react';
import { 
  CheckCircle2, Circle, AlertCircle, Clock, 
  Edit2, Link, Calendar, AlertTriangle, 
  CheckSquare, Square, ChevronDown, ChevronUp, Plus, MessageCircle, History 
} from 'lucide-react';
import { updateTaskStatus, updateTask, createSubtask, updateSubtaskStatus, deleteSubtask } from '@/lib/actions';

export function getStatusIcon(status: string) {
  switch (status) {
    case 'TODO': return <Circle size={18} color="var(--text-secondary)" />;
    case 'IN_PROGRESS': return <Clock size={18} color="var(--primary-color)" />;
    case 'DONE': return <CheckCircle2 size={18} color="var(--success-color)" />;
    case 'STUCK': return <AlertCircle size={18} color="var(--danger-color)" />;
    default: return <Circle size={18} />;
  }
}

export function getPriorityBadge(priority: string = 'MEDIUM') {
  switch (priority) {
    case 'HIGH': return <span className="badge badge-priority-HIGH">🔴 דחוף</span>;
    case 'MEDIUM': return <span className="badge badge-priority-MEDIUM">🟡 רגיל</span>;
    case 'LOW': return <span className="badge badge-priority-LOW">⚪ נמוך</span>;
    default: return <span className="badge badge-priority-MEDIUM">🟡 רגיל</span>;
  }
}

export default function TaskCard({ 
  task, 
  initialSubtasks, 
  initialTopics, 
  approvedUsers, 
  editingTaskId, 
  setEditingTaskId, 
  expandedTaskId, 
  setExpandedTaskId, 
  addingSubtaskToTaskId, 
  setAddingSubtaskToTaskId 
}: any) {
  
  const taskSubtasks = initialSubtasks.filter((st: any) => st.task_id === task.id);
  const completedSubtasks = taskSubtasks.filter((st: any) => st.status === 'DONE').length;

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  const fetchAuditLogs = async () => {
    if (!showAuditLogs) {
      try {
        const { getTaskAuditLogs } = await import('@/lib/actions');
        const logs = await getTaskAuditLogs(task.id);
        setAuditLogs(logs);
      } catch (err) {}
    }
    setShowAuditLogs(!showAuditLogs);
  };

  if (editingTaskId === task.id) {
    return (
      <div key={task.id} id={`task-${task.id}`} className="task-card" style={{ marginBottom: '16px', border: '1px solid var(--primary-color)', flexWrap: 'wrap', backgroundColor: '#f8f9fa', borderRadius: '16px' }}>
        <form action={async (formData) => {
          await updateTask(task.id, formData);
          setEditingTaskId(null);
        }} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="text" name="title" defaultValue={task.title} required placeholder="תיאור המשימה..." style={{ fontSize: '16px', fontWeight: 'bold' }} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <select name="topicId" required defaultValue={task.topic_id}>
              <option value="" disabled>בחר נושא</option>
              {initialTopics.map((t: any) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
            
            <select name="userId" defaultValue={task.user_id || ''}>
              <option value="">ללא שיוך</option>
              {approvedUsers.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>

            <select name="priority" defaultValue={task.priority || 'MEDIUM'}>
              <option value="HIGH">🔴 דחוף</option>
              <option value="MEDIUM">🟡 רגיל</option>
              <option value="LOW">⚪ נמוך</option>
            </select>

            <input type="date" name="dueDate" defaultValue={task.due_date || ''} />
          </div>

          <textarea name="description" placeholder="הערות או תיאור מורחב..." defaultValue={task.description} rows={2}></textarea>
          <textarea name="progressLog" placeholder="הערת סטטוס והתקדמות שוטפת (לדוגמה: 16/08 בוצעו 4 ראיונות מתוך 10)..." defaultValue={task.progress_log} rows={2}></textarea>
          <input type="url" name="driveLink" defaultValue={task.drive_link} placeholder="קישור לדרייב (אופציונלי)" />

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid #ccc', paddingTop: '12px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setEditingTaskId(null)}>ביטול</button>
            <button type="submit" className="btn">שמור</button>
          </div>
        </form>
      </div>
    );
  }

  if (expandedTaskId === task.id) {
    return (
      <div key={task.id} id={`task-${task.id}`} className="task-card expanded-card" style={{ marginBottom: '16px', flexDirection: 'column', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              className="status-toggle-btn"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
              onClick={(e) => {
                e.stopPropagation();
                // Fix 3-state toggle as recommended by UX expert
                const nextStatus = task.status === 'TODO' ? 'IN_PROGRESS' : task.status === 'IN_PROGRESS' ? 'DONE' : 'TODO';
                updateTaskStatus(task.id, nextStatus);
              }}
            >
              {getStatusIcon(task.status)}
            </div>
            <div className="task-title" style={{ margin: 0, textDecoration: task.status === 'DONE' ? 'line-through' : 'none', color: task.status === 'DONE' ? 'var(--text-secondary)' : 'inherit', fontSize: '18px', fontWeight: 'bold' }}>
              {task.title}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={(e) => { e.stopPropagation(); setEditingTaskId(task.id); }}>
              <Edit2 size={16} /> ערוך
            </button>
            <button type="button" className="btn btn-outline" style={{ padding: '6px', border: 'none' }} onClick={(e) => { e.stopPropagation(); setExpandedTaskId(null); }}>
              <ChevronUp size={20} />
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)', background: '#f8f9fa', padding: '12px', borderRadius: '8px' }}>
          <div><strong style={{ color: 'var(--text-primary)' }}>נושא:</strong> {task.topic_title}</div>
          <div><strong style={{ color: 'var(--text-primary)' }}>שויך ל:</strong> {task.user_name || 'לא שויך'}</div>
          <div><strong style={{ color: 'var(--text-primary)' }}>עדיפות:</strong> {getPriorityBadge(task.priority)}</div>
          {task.due_date && <div><strong style={{ color: 'var(--text-primary)' }}>תאריך יעד:</strong> {new Date(task.due_date).toLocaleDateString('he-IL')}</div>}
        </div>

        {task.description && (
          <div style={{ marginTop: '16px', fontSize: '14px', lineHeight: '1.5' }}>
            <strong>תיאור מלא:</strong><br/>
            {task.description}
          </div>
        )}

        {task.progress_log && (
          <div style={{ marginTop: '16px', fontSize: '14px', lineHeight: '1.5', background: '#e8f0fe', padding: '12px', borderRadius: '8px', color: '#1a73e8' }}>
            <strong>יומן התקדמות / סטטוס:</strong><br/>
            {task.progress_log}
          </div>
        )}

        {/* Subtasks (רמה ג') */}
        <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
          <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px', color: 'var(--primary-color)' }}>
            תת-משימות ({completedSubtasks}/{taskSubtasks.length})
          </div>
          {taskSubtasks.map((st: any) => (
            <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
              <div style={{ cursor: 'pointer', color: st.status === 'DONE' ? 'var(--success-color)' : 'var(--text-secondary)' }} onClick={() => updateSubtaskStatus(st.id, st.status === 'DONE' ? 'TODO' : 'DONE')}>
                {st.status === 'DONE' ? <CheckSquare size={16} /> : <Square size={16} />}
              </div>
              <div style={{ fontSize: '14px', flex: 1, textDecoration: st.status === 'DONE' ? 'line-through' : 'none', color: st.status === 'DONE' ? 'var(--text-secondary)' : 'inherit' }}>
                {st.title}
              </div>
              <button type="button" onClick={() => { if(confirm('למחוק תת-משימה זו?')) deleteSubtask(st.id) }} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '12px' }}>
                מחק
              </button>
            </div>
          ))}
            
          {addingSubtaskToTaskId === task.id ? (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <input type="text" id={`new-subtask-${task.id}`} autoFocus placeholder="תיאור תת-משימה..." style={{ flex: 1, padding: '8px', fontSize: '14px', borderRadius: '8px', border: '1px solid #ccc' }} required />
              <button type="button" className="btn" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={async () => {
                const input = document.getElementById(`new-subtask-${task.id}`) as HTMLInputElement;
                if (input && input.value) {
                  await createSubtask(task.id, input.value);
                  setAddingSubtaskToTaskId(null);
                }
              }}>שמור</button>
              <button type="button" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => setAddingSubtaskToTaskId(null)}>ביטול</button>
            </div>
          ) : (
            <div style={{ marginTop: '12px' }}>
              <button type="button" onClick={() => setAddingSubtaskToTaskId(task.id)} style={{ background: '#f8f9fa', border: '1px dashed #ccc', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', width: '100%', justifyContent: 'center' }}>
                <Plus size={16} /> הוסף תת-משימה
              </button>
            </div>
          )}
        </div>
        {/* Audit Logs */}
        <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); fetchAuditLogs(); }}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-secondary)', 
              cursor: 'pointer', 
              fontSize: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontWeight: 600 
            }}
          >
            <History size={16} /> 
            {showAuditLogs ? 'הסתר היסטוריית פעולות' : 'הצג היסטוריית פעולות'}
          </button>
          
          {showAuditLogs && (
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '8px' }}>
              {auditLogs.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>אין היסטוריית פעולות מוקלטת.</div>
              ) : (
                auditLogs.map((log, idx) => (
                  <div key={idx} style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', background: 'var(--bg-color)', padding: '8px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '12px' }}>
                      <span>{log.user_name || 'מערכת'}</span>
                      <span>{new Date(log.created_at).toLocaleString('he-IL')}</span>
                    </div>
                    <div>
                      {log.action === 'CREATED' && <span>יצר/ה את המשימה.</span>}
                      {log.action === 'STATUS_CHANGED' && <span>שינה/תה סטטוס מ-<b>{log.old_value}</b> ל-<b>{log.new_value}</b>.</span>}
                      {log.action === 'UPDATED' && <span>ערך/ה את פרטי המשימה.</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      key={task.id} 
      id={`task-${task.id}`} 
      className="task-card minimal-card premium-shadow" 
      onClick={() => setExpandedTaskId(task.id)}
      style={{ cursor: 'pointer', padding: '16px', display: 'flex', alignItems: 'center', borderRadius: '16px', marginBottom: '12px' }}
      role="button"
      tabIndex={0}
      aria-label={`משימה: ${task.title}`}
    >
      <div 
        className="status-toggle-btn"
        style={{ cursor: 'pointer', marginRight: '16px', display: 'flex', alignItems: 'center' }} 
        onClick={(e) => {
          e.stopPropagation();
          const nextStatus = task.status === 'TODO' ? 'IN_PROGRESS' : task.status === 'IN_PROGRESS' ? 'DONE' : 'TODO';
          updateTaskStatus(task.id, nextStatus);
        }}
        role="button"
        tabIndex={0}
        aria-label="שינוי סטטוס"
      >
        {getStatusIcon(task.status)}
      </div>
      
      <div className="task-content" style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="task-title" style={{ margin: 0, textDecoration: task.status === 'DONE' ? 'line-through' : 'none', color: task.status === 'DONE' ? 'var(--text-secondary)' : 'inherit', fontSize: '16px', fontWeight: 600 }}>
            {task.title}
          </div>
        </div>
        <div className="task-meta" style={{ marginTop: '6px', fontSize: '13px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ color: 'var(--primary-color)', fontWeight: 500, background: 'rgba(26,115,232,0.1)', padding: '2px 8px', borderRadius: '12px' }}>{task.topic_title}</span>
          <span style={{ color: '#5f6368' }}>{task.user_name || 'לא שויך'}</span>
          {getPriorityBadge(task.priority)}
          {taskSubtasks.length > 0 && (
             <span style={{ color: '#5f6368', display: 'flex', alignItems: 'center', gap: '4px' }}>
               <CheckSquare size={14} /> {completedSubtasks}/{taskSubtasks.length}
             </span>
          )}
        </div>
      </div>

      {/* Quick Actions (Drive & WhatsApp) */}
      <div className="quick-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '12px' }}>
        {task.drive_link && (
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); window.open(task.drive_link, '_blank'); }}
            title="פתיחת קבצים ב-Drive"
            style={{ background: '#e8f0fe', border: 'none', color: '#1a73e8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '10px', borderRadius: '50%' }}
          >
            <Link size={18} />
          </button>
        )}
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const text = `משימה: ${task.title}%0Aנושא: ${task.topic_title || 'ללא נושא'}%0Aאחראי: ${task.user_name || 'טרם שויך'}%0Aעדיפות: ${task.priority === 'HIGH' ? 'דחוף' : 'רגיל'}${task.due_date ? '%0Aיעד: ' + task.due_date : ''}${task.progress_log ? '%0Aסטטוס: ' + task.progress_log : ''}%0A%0Aלצפייה במשימה: https://difs.vercel.app/`;
            window.open(`https://wa.me/?text=${text}`, '_blank');
          }}
          title="שתף ב-WhatsApp"
          style={{ background: '#e6f4ea', border: 'none', color: '#1e8e3e', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '10px', borderRadius: '50%' }}
        >
          <MessageCircle size={18} />
        </button>
      </div>

      <ChevronDown size={20} color="#9aa0a6" style={{ marginLeft: '4px' }} />
    </div>
  );
}
