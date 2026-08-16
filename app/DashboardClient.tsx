'use client';

import { useState } from 'react';
import { logout, createTopic, createTask, updateTaskStatus, deleteTask, updateTask } from '@/lib/actions';
import { 
  CheckCircle2, Circle, AlertCircle, Clock, 
  Plus, LogOut, LayoutDashboard, Folder, User, MessageCircle, BarChart, Edit2, Link, ExternalLink
} from 'lucide-react';

export default function DashboardClient({ initialTopics, initialTasks, users, currentUser }: any) {
  const [activeFilter, setActiveFilter] = useState<number | 'ALL' | 'MY'>('ALL');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const getFilteredTasks = () => {
    let filtered = initialTasks;
    if (activeFilter === 'MY') {
      filtered = filtered.filter((t: any) => t.user_id === currentUser.userId);
    } else if (typeof activeFilter === 'number') {
      filtered = filtered.filter((t: any) => t.topic_id === activeFilter);
    }
    return filtered;
  };

  const tasks = getFilteredTasks();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TODO': return <span className="badge badge-todo">לביצוע</span>;
      case 'IN_PROGRESS': return <span className="badge badge-progress">בתהליך</span>;
      case 'DONE': return <span className="badge badge-done">בוצע</span>;
      case 'STUCK': return <span className="badge badge-stuck">תקוע</span>;
      default: return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'TODO': return <Circle size={18} color="var(--text-secondary)" />;
      case 'IN_PROGRESS': return <Clock size={18} color="var(--primary-color)" />;
      case 'DONE': return <CheckCircle2 size={18} color="var(--success-color)" />;
      case 'STUCK': return <AlertCircle size={18} color="var(--danger-color)" />;
      default: return <Circle size={18} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">ניהול משימות שלדור</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            שלום, {currentUser.name}
          </div>
        </div>

        <div 
          className={`nav-item ${activeFilter === 'DASHBOARD' ? 'active' : ''}`}
          onClick={() => setActiveFilter('DASHBOARD')}
        >
          <BarChart size={18} style={{ marginLeft: '12px' }} />
          דשבורד ודוחות
        </div>

        <div 
          className={`nav-item ${activeFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveFilter('ALL')}
        >
          <LayoutDashboard size={18} style={{ marginLeft: '12px' }} />
          כל המשימות
        </div>
        
        <div 
          className={`nav-item ${activeFilter === 'MY' ? 'active' : ''}`}
          onClick={() => setActiveFilter('MY')}
        >
          <User size={18} style={{ marginLeft: '12px' }} />
          המשימות שלי
        </div>

        <div style={{ marginTop: '24px', marginBottom: '8px', padding: '0 24px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          נושאים
        </div>

        {initialTopics.map((topic: any) => (
          <div 
            key={topic.id}
            className={`nav-item ${activeFilter === topic.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(topic.id)}
          >
            <Folder size={18} style={{ marginLeft: '12px' }} />
            {topic.title}
          </div>
        ))}

        <div style={{ marginTop: '24px', marginBottom: '8px', padding: '0 24px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          משאבים משותפים
        </div>
        <a 
          href="https://drive.google.com/drive/folders/1NMq5a8InOdfhupnxYf77byoRdmzxJd8B?usp=sharing"
          target="_blank"
          rel="noreferrer"
          className="nav-item"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <ExternalLink size={18} style={{ marginLeft: '12px', color: '#1fa463' }} />
          כונן משותף (Drive)
        </a>

        <div 
          className="nav-item" 
          style={{ marginTop: 'auto', color: 'var(--danger-color)' }}
          onClick={() => logout()}
        >
          <LogOut size={18} style={{ marginLeft: '12px' }} />
          התנתק
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <h2>
            {activeFilter === 'DASHBOARD' && 'דשבורד ודוחות (פיקוח ובקרה)'}
            {activeFilter === 'ALL' && 'כל המשימות'}
            {activeFilter === 'MY' && 'המשימות שלי'}
            {typeof activeFilter === 'number' && initialTopics.find((t: any) => t.id === activeFilter)?.title}
          </h2>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline" onClick={() => setShowNewTopicForm(true)}>
              <Plus size={16} /> נושא חדש
            </button>
            <button className="btn" onClick={() => setShowNewTaskForm(true)}>
              <Plus size={16} /> משימה חדשה
            </button>
          </div>
        </div>

        <div className="content-area">
          {activeFilter === 'DASHBOARD' ? (
            <div className="dashboard-stats">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3>סטטוס התקדמות נושאים</h3>
                <button className="btn" onClick={() => window.print()}>הדפס דוח לפיקוד</button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Topics Progress */}
                <div className="task-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <h4 style={{ marginBottom: '16px' }}>התקדמות לפי נושא</h4>
                  {initialTopics.map((topic: any) => {
                    const topicTasks = initialTasks.filter((t: any) => t.topic_id === topic.id);
                    const doneTasks = topicTasks.filter((t: any) => t.status === 'DONE');
                    const progress = topicTasks.length === 0 ? 0 : Math.round((doneTasks.length / topicTasks.length) * 100);
                    
                    return (
                      <div key={topic.id} style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px' }}>
                          <span>{topic.title}</span>
                          <span>{progress}% ({doneTasks.length}/{topicTasks.length})</span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--success-color)' }} />
                        </div>
                      </div>
                    );
                  })}
                  {initialTopics.length === 0 && <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>אין נושאים מוגדרים.</div>}
                </div>

                {/* Team Distribution */}
                <div className="task-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <h4 style={{ marginBottom: '16px' }}>עומס משימות לפי חבר צוות</h4>
                  {users.map((user: any) => {
                    const userTasks = initialTasks.filter((t: any) => t.user_id === user.id);
                    const pendingTasks = userTasks.filter((t: any) => t.status !== 'DONE');
                    
                    if (userTasks.length === 0) return null;
                    return (
                      <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '14px' }}>{user.name}</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span className="badge badge-todo">{pendingTasks.length} פתוחות</span>
                          <span className="badge badge-done">{userTasks.length - pendingTasks.length} הושלמו</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* New Topic Form */}
          {showNewTopicForm && (
            <div className="task-card" style={{ marginBottom: '16px', border: '1px solid var(--primary-color)' }}>
              <form action={async (formData) => {
                await createTopic(formData);
                setShowNewTopicForm(false);
              }} style={{ display: 'flex', gap: '16px', width: '100%', alignItems: 'center' }}>
                <input type="text" name="title" placeholder="שם הנושא (לדוגמה: ניהול ידע)" required style={{ flex: 1 }} />
                <button type="submit" className="btn">שמור</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowNewTopicForm(false)}>ביטול</button>
              </form>
            </div>
          )}

          {/* New Task Form */}
          {showNewTaskForm && (
            <div className="task-card" style={{ marginBottom: '16px', border: '1px solid var(--primary-color)', flexWrap: 'wrap' }}>
              <form action={async (formData) => {
                await createTask(formData);
                setShowNewTaskForm(false);
              }} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="text" name="title" placeholder="תיאור המשימה..." required />
                <input type="url" name="driveLink" placeholder="קישור לתיקייה/קובץ בדרייב (אופציונלי)" />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <select name="topicId" required defaultValue={typeof activeFilter === 'number' ? activeFilter : ''}>
                    <option value="" disabled>בחר נושא</option>
                    {initialTopics.map((t: any) => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                  
                  <select name="userId" defaultValue={currentUser.userId}>
                    <option value="">ללא שיוך</option>
                    {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowNewTaskForm(false)}>ביטול</button>
                  <button type="submit" className="btn">הוסף משימה</button>
                </div>
              </form>
            </div>
          )}

          {/* Task List */}
          <div className="task-list">
            {tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                אין משימות בתצוגה זו.
              </div>
            ) : (
              tasks.map((task: any) => (
                editingTaskId === task.id ? (
                  <div key={task.id} className="task-card" style={{ marginBottom: '16px', border: '1px solid var(--primary-color)', flexWrap: 'wrap', backgroundColor: '#f8f9fa' }}>
                    <form action={async (formData) => {
                      await updateTask(task.id, formData);
                      setEditingTaskId(null);
                    }} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input type="text" name="title" defaultValue={task.title} required placeholder="תיאור המשימה..." />
                      <textarea name="description" placeholder="הערות או תיאור מורחב (אופציונלי)..." defaultValue={task.description} rows={3}></textarea>
                      <input type="url" name="driveLink" defaultValue={task.drive_link} placeholder="קישור לדרייב (אופציונלי)" />
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <select name="topicId" required defaultValue={task.topic_id}>
                          <option value="" disabled>בחר נושא</option>
                          {initialTopics.map((t: any) => <option key={t.id} value={t.id}>{t.title}</option>)}
                        </select>
                        
                        <select name="userId" defaultValue={task.user_id || ''}>
                          <option value="">ללא שיוך</option>
                          {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-outline" onClick={() => setEditingTaskId(null)}>ביטול</button>
                        <button type="submit" className="btn">שמור שינויים</button>
                      </div>
                    </form>
                  </div>
                ) : (
                <div key={task.id} className="task-card">
                  <div style={{ cursor: 'pointer' }} onClick={() => updateTaskStatus(task.id, task.status === 'DONE' ? 'TODO' : 'DONE')}>
                    {getStatusIcon(task.status)}
                  </div>
                  
                  <div className="task-content">
                    <div className="task-title" style={{ textDecoration: task.status === 'DONE' ? 'line-through' : 'none', color: task.status === 'DONE' ? 'var(--text-secondary)' : 'inherit' }}>
                      {task.title}
                    </div>
                    {task.description && (
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', whiteSpace: 'pre-wrap' }}>
                        {task.description}
                      </div>
                    )}
                    <div className="task-meta">
                      <span>{task.topic_title}</span>
                      <span>•</span>
                      <span>{task.user_name || 'לא שויך'}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select 
                      value={task.status} 
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      style={{ width: 'auto', padding: '4px 8px', fontSize: '12px', height: '28px' }}
                    >
                      <option value="TODO">לביצוע</option>
                      <option value="IN_PROGRESS">בתהליך</option>
                      <option value="DONE">בוצע</option>
                      <option value="STUCK">תקוע</option>
                    </select>
                    {getStatusBadge(task.status)}
                    {task.drive_link && (
                      <button 
                        onClick={() => window.open(task.drive_link, '_blank')}
                        title="פתיחת קבצים ב-Drive"
                        style={{ background: 'none', border: 'none', color: '#1fa463', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '4px' }}
                      >
                        <Link size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => setEditingTaskId(task.id)}
                      title="ערוך משימה והערות"
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '4px' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        const text = `משימה חדשה: ${task.title}\nנושא: ${task.topic_title || 'ללא נושא'}\nאחראי: ${task.user_name || 'טרם שויך'}${task.description ? '\nהערות: ' + task.description : ''}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      title="שתף ב-WhatsApp"
                      style={{ background: 'none', border: 'none', color: '#25D366', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '4px' }}
                    >
                      <MessageCircle size={16} />
                    </button>
                    <button 
                      onClick={() => { if(confirm('למחוק משימה זו?')) deleteTask(task.id) }} 
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )))
            )}
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
