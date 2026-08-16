'use client';

import { useState } from 'react';
import { logout, createTopic, createTask, updateTaskStatus, deleteTask, updateTask } from '@/lib/actions';
import { 
  CheckCircle2, Circle, AlertCircle, Clock, 
  Plus, LogOut, LayoutDashboard, Folder, User, MessageCircle, BarChart, Edit2, Link, ExternalLink,
  Calendar, AlertTriangle, Download, Copy, Check, Share2
} from 'lucide-react';

export default function DashboardClient({ initialTopics, initialTasks, users, currentUser }: any) {
  const [activeFilter, setActiveFilter] = useState<number | 'ALL' | 'MY' | 'DASHBOARD'>('ALL');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

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

  const getPriorityBadge = (priority: string = 'MEDIUM') => {
    switch (priority) {
      case 'HIGH': return <span className="badge badge-priority-HIGH">🔴 דחוף</span>;
      case 'MEDIUM': return <span className="badge badge-priority-MEDIUM">🟡 רגיל</span>;
      case 'LOW': return <span className="badge badge-priority-LOW">⚪ נמוך</span>;
      default: return <span className="badge badge-priority-MEDIUM">🟡 רגיל</span>;
    }
  };

  const getDueDateBadge = (dueDate: string | null, status: string) => {
    if (!dueDate) return null;
    if (status === 'DONE') {
      return (
        <span className="badge badge-date-future" style={{ opacity: 0.7 }}>
          <Calendar size={12} /> {dueDate}
        </span>
      );
    }

    if (dueDate < todayStr) {
      return (
        <span className="badge badge-date-overdue">
          <AlertTriangle size={12} /> באיחור ({dueDate})
        </span>
      );
    } else if (dueDate === todayStr) {
      return (
        <span className="badge badge-date-today">
          <Clock size={12} /> יעד: היום
        </span>
      );
    } else {
      return (
        <span className="badge badge-date-future">
          <Calendar size={12} /> {dueDate}
        </span>
      );
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

  // Executive Flash Report Calculations
  const completedTasks = initialTasks.filter((t: any) => t.status === 'DONE');
  const stuckTasks = initialTasks.filter((t: any) => t.status === 'STUCK');
  const overdueTasks = initialTasks.filter((t: any) => t.status !== 'DONE' && t.due_date && t.due_date < todayStr);
  const urgentTasks = initialTasks.filter((t: any) => t.status !== 'DONE' && t.priority === 'HIGH');
  const inProgressTasks = initialTasks.filter((t: any) => t.status === 'IN_PROGRESS' || t.status === 'TODO');

  const exportToCSV = () => {
    const headers = ['מספר', 'משימה', 'נושא', 'אחראי', 'סטטוס', 'עדיפות', 'תאריך יעד', 'הערת התקדמות', 'קישור דרייב'];
    const rows = initialTasks.map((t: any) => [
      t.id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.topic_title || '').replace(/"/g, '""')}"`,
      `"${(t.user_name || 'טרם שויך').replace(/"/g, '""')}"`,
      t.status === 'DONE' ? 'בוצע' : t.status === 'IN_PROGRESS' ? 'בתהליך' : t.status === 'STUCK' ? 'תקוע' : 'לביצוע',
      t.priority === 'HIGH' ? 'דחוף' : t.priority === 'LOW' ? 'נמוך' : 'רגיל',
      t.due_date || '',
      `"${(t.progress_log || t.description || '').replace(/"/g, '""')}"`,
      t.drive_link || ''
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `shaldor_tasks_report_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyExecutiveWhatsapp = () => {
    let msg = `📊 *סטטוס שבועי - ניהול משימות שלדור*\n`;
    msg += `תאריך: ${todayStr}\n\n`;

    msg += `✅ *מה הושלם לאחרונה:*\n`;
    if (completedTasks.length === 0) msg += `אין משימות שסומנו כהושלמו.\n`;
    else {
      completedTasks.slice(0, 5).forEach((t: any) => {
        msg += `• ${t.title} (${t.user_name || 'ללא שיוך'})\n`;
      });
    }

    msg += `\n⚠️ *צווארי בקבוק וחריגות:*\n`;
    const issues = [...stuckTasks, ...overdueTasks.filter((o: any) => !stuckTasks.some((s: any) => s.id === o.id))];
    if (issues.length === 0) msg += `אין חריגות או משימות תקועות 🎉\n`;
    else {
      issues.forEach((t: any) => {
        msg += `• ${t.title} [${t.status === 'STUCK' ? 'תקוע' : 'באיחור'}] - אחראי: ${t.user_name || 'לא שויך'}\n`;
      });
    }

    msg += `\n🎯 *יעדים מרכזיים לשבוע הבא:*\n`;
    const focusTasks = urgentTasks.length > 0 ? urgentTasks : inProgressTasks.slice(0, 5);
    if (focusTasks.length === 0) msg += `אין משימות דחופות פתוחות.\n`;
    else {
      focusTasks.forEach((t: any) => {
        msg += `• ${t.title} (${t.user_name || 'לא שויך'})${t.due_date ? ' - יעד: ' + t.due_date : ''}\n`;
      });
    }

    navigator.clipboard.writeText(msg);
    setCopiedWhatsapp(true);
    setTimeout(() => setCopiedWhatsapp(false), 3000);
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
            {activeFilter === 'DASHBOARD' && 'דשבורד ודוחות פיקוד'}
            {activeFilter === 'ALL' && 'כל המשימות'}
            {activeFilter === 'MY' && 'המשימות שלי'}
            {typeof activeFilter === 'number' && initialTopics.find((t: any) => t.id === activeFilter)?.title}
          </h2>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {activeFilter === 'DASHBOARD' ? (
              <>
                <button className="btn btn-outline" onClick={exportToCSV} title="ייצוא לאקסל">
                  <Download size={16} /> אקסל (CSV)
                </button>
                <button className="btn btn-outline" onClick={copyExecutiveWhatsapp} title="העתק סיכום לוואטסאפ של הפיקוד">
                  {copiedWhatsapp ? <Check size={16} color="var(--success-color)" /> : <Share2 size={16} />} 
                  {copiedWhatsapp ? 'הועתק!' : 'סיכום לוואטסאפ'}
                </button>
                <button className="btn" onClick={() => window.print()}>
                  הדפס One-Pager
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-outline" onClick={() => setShowNewTopicForm(true)}>
                  <Plus size={16} /> נושא חדש
                </button>
                <button className="btn" onClick={() => setShowNewTaskForm(true)}>
                  <Plus size={16} /> משימה חדשה
                </button>
              </>
            )}
          </div>
        </div>

        <div className="content-area">
          {activeFilter === 'DASHBOARD' ? (
            <div className="dashboard-stats">
              {/* Executive Metrics Banner */}
              <div className="metric-banner">
                <div className="metric-box">
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>סה"כ משימות</div>
                  <div className="num" style={{ color: 'var(--text-primary)' }}>{initialTasks.length}</div>
                </div>
                <div className="metric-box">
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>הושלמו</div>
                  <div className="num" style={{ color: 'var(--success-color)' }}>{completedTasks.length}</div>
                </div>
                <div className="metric-box">
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>דחופות פתוחות</div>
                  <div className="num" style={{ color: '#c5221f' }}>{urgentTasks.length}</div>
                </div>
                <div className="metric-box">
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>חריגות / תקועות</div>
                  <div className="num" style={{ color: 'var(--danger-color)' }}>{stuckTasks.length + overdueTasks.length}</div>
                </div>
              </div>

              {/* Executive Flash Report (3 Columns) */}
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>📋 דוח סטטוס שבועי לפיקוד (Flash Report)</h3>
                <div className="report-grid">
                  {/* Section 1: What was achieved */}
                  <div className="report-card" style={{ borderTop: '4px solid var(--success-color)' }}>
                    <div className="report-card-header" style={{ color: 'var(--success-color)' }}>
                      <span>✅ מה הושלם</span>
                      <span className="badge badge-done">{completedTasks.length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                      {completedTasks.length === 0 ? (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>אין משימות שהושלמו לאחרונה.</div>
                      ) : (
                        completedTasks.map((t: any) => (
                          <div key={t.id} className="report-item">
                            <div style={{ fontWeight: 500 }}>{t.title}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              {t.topic_title} • {t.user_name || 'ללא שיוך'}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Section 2: Blockers & Overdue */}
                  <div className="report-card" style={{ borderTop: '4px solid var(--danger-color)' }}>
                    <div className="report-card-header" style={{ color: 'var(--danger-color)' }}>
                      <span>⚠️ צווארי בקבוק וחריגות</span>
                      <span className="badge badge-stuck">{stuckTasks.length + overdueTasks.length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                      {stuckTasks.length === 0 && overdueTasks.length === 0 ? (
                        <div style={{ color: 'var(--success-color)', fontSize: '13px' }}>אין חריגות או צווארי בקבוק פתוחים 🎉</div>
                      ) : (
                        <>
                          {stuckTasks.map((t: any) => (
                            <div key={`stuck-${t.id}`} className="report-item" style={{ borderRight: '3px solid var(--danger-color)' }}>
                              <div style={{ fontWeight: 500, color: 'var(--danger-color)' }}>[תקוע] {t.title}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                אחראי: {t.user_name || 'לא שויך'} • {t.progress_log || 'אין פירוט סיבה'}
                              </div>
                            </div>
                          ))}
                          {overdueTasks.map((t: any) => (
                            <div key={`overdue-${t.id}`} className="report-item" style={{ borderRight: '3px solid #e37400' }}>
                              <div style={{ fontWeight: 500 }}>[באיחור] {t.title}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                יעד היה: {t.due_date} • אחראי: {t.user_name || 'לא שויך'}
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Section 3: Next week focus */}
                  <div className="report-card" style={{ borderTop: '4px solid var(--primary-color)' }}>
                    <div className="report-card-header" style={{ color: 'var(--primary-color)' }}>
                      <span>🎯 יעדים לשבוע הבא</span>
                      <span className="badge badge-progress">{urgentTasks.length > 0 ? urgentTasks.length : inProgressTasks.length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                      {(urgentTasks.length > 0 ? urgentTasks : inProgressTasks).length === 0 ? (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>אין משימות פתוחות בתהליך.</div>
                      ) : (
                        (urgentTasks.length > 0 ? urgentTasks : inProgressTasks).map((t: any) => (
                          <div key={t.id} className="report-item">
                            <div style={{ fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                              <span>{t.title}</span>
                              {getPriorityBadge(t.priority)}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              {t.topic_title} • אחראי: {t.user_name || 'לא שויך'} {t.due_date ? `• יעד: ${t.due_date}` : ''}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Topics Progress & Team Load */}
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
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                      <select name="topicId" required defaultValue={typeof activeFilter === 'number' ? activeFilter : ''}>
                        <option value="" disabled>בחר נושא</option>
                        {initialTopics.map((t: any) => <option key={t.id} value={t.id}>{t.title}</option>)}
                      </select>
                      
                      <select name="userId" defaultValue={currentUser.userId}>
                        <option value="">ללא שיוך</option>
                        {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>

                      <select name="priority" defaultValue="MEDIUM">
                        <option value="HIGH">🔴 עדיפות: דחוף</option>
                        <option value="MEDIUM">🟡 עדיפות: רגיל</option>
                        <option value="LOW">⚪ עדיפות: נמוך</option>
                      </select>

                      <input type="date" name="dueDate" placeholder="תאריך יעד" />
                    </div>

                    <input type="url" name="driveLink" placeholder="קישור לתיקייה/קובץ בדרייב (אופציונלי)" />

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
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                            <select name="topicId" required defaultValue={task.topic_id}>
                              <option value="" disabled>בחר נושא</option>
                              {initialTopics.map((t: any) => <option key={t.id} value={t.id}>{t.title}</option>)}
                            </select>
                            
                            <select name="userId" defaultValue={task.user_id || ''}>
                              <option value="">ללא שיוך</option>
                              {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>

                            <select name="priority" defaultValue={task.priority || 'MEDIUM'}>
                              <option value="HIGH">🔴 עדיפות: דחוף</option>
                              <option value="MEDIUM">🟡 עדיפות: רגיל</option>
                              <option value="LOW">⚪ עדיפות: נמוך</option>
                            </select>

                            <input type="date" name="dueDate" defaultValue={task.due_date || ''} />
                          </div>

                          <textarea name="description" placeholder="הערות או תיאור מורחב..." defaultValue={task.description} rows={2}></textarea>
                          <textarea name="progressLog" placeholder="הערת סטטוס והתקדמות שוטפת (לדוגמה: 16/08 בוצעו 4 ראיונות מתוך 10)..." defaultValue={task.progress_log} rows={2}></textarea>
                          <input type="url" name="driveLink" defaultValue={task.drive_link} placeholder="קישור לדרייב (אופציונלי)" />

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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="task-title" style={{ textDecoration: task.status === 'DONE' ? 'line-through' : 'none', color: task.status === 'DONE' ? 'var(--text-secondary)' : 'inherit' }}>
                            {task.title}
                          </div>
                          {getPriorityBadge(task.priority)}
                          {getDueDateBadge(task.due_date, task.status)}
                        </div>

                        {task.description && (
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px', whiteSpace: 'pre-wrap' }}>
                            {task.description}
                          </div>
                        )}

                        {task.progress_log && (
                          <div style={{ fontSize: '12px', background: '#f1f3f4', borderRight: '3px solid var(--primary-color)', padding: '4px 8px', borderRadius: '4px', margin: '4px 0', color: '#3c4043' }}>
                            <strong>סטטוס אחרון:</strong> {task.progress_log}
                          </div>
                        )}

                        <div className="task-meta" style={{ marginTop: '4px' }}>
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
                          title="ערוך משימה, עדיפות וסטטוס"
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '4px' }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            const text = `משימה: ${task.title}\nנושא: ${task.topic_title || 'ללא נושא'}\nאחראי: ${task.user_name || 'טרם שויך'}\nעדיפות: ${task.priority === 'HIGH' ? 'דחוף' : 'רגיל'}${task.due_date ? '\nיעד: ' + task.due_date : ''}${task.progress_log ? '\nסטטוס: ' + task.progress_log : ''}`;
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
