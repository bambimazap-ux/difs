'use client';

import { useState, useEffect } from 'react';

import { exportToCSV, generateExecutiveWhatsappMsg } from '@/lib/utils';
import TaskCard from './components/TaskCard';
import TopicGrid from './components/TopicGrid';
import MobileNav from './components/MobileNav';
import Sidebar from './components/Sidebar';

import { useRouter } from 'next/navigation';
import { logout, createTopic, createTask, updateTaskStatus, deleteTask, updateTask, createTeamMember, approveUser, rejectUser, revokeUserAccess, createSubtask, updateSubtaskStatus, deleteSubtask } from '@/lib/actions';
import { 
  CheckCircle2, Circle, AlertCircle, Clock, 
  Plus, LogOut, LayoutDashboard, Folder, User, MessageCircle, BarChart, Edit2, Link, ExternalLink,
  Calendar, AlertTriangle, Download, Copy, Check, Share2, UserPlus, UserCheck, UserX, CheckSquare, Square,
  Home, Users, ChevronDown, ChevronUp, Menu
} from 'lucide-react';


export default function DashboardClient({ initialTopics, initialTasks, initialSubtasks = [], users, currentUser }: any) {
  const router = useRouter();

  // Optimized Polling: Only refresh if the user is actively viewing the tab (Visibility API)
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        router.refresh();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [router]);

  const [activeFilter, setActiveFilter] = useState<number | string | 'ALL' | 'MY' | 'DASHBOARD' | 'HOME_TOPICS' | 'USERS'>('HOME_TOPICS');
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [userFormMsg, setUserFormMsg] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [addingSubtaskToTaskId, setAddingSubtaskToTaskId] = useState<number | null>(null);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'OPEN' | 'DONE' | 'ALL'>('OPEN');
  const [isNewTopic, setIsNewTopic] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };
  const approvedUsers = users.filter((u: any) => u.is_approved === 1);
  const pendingUsers = users.filter((u: any) => u.is_approved === 0);

  const todayStr = new Date().toISOString().split('T')[0];

  const getFilteredTasks = () => {
    let filtered = initialTasks;
    if (activeFilter === 'MY') {
      filtered = filtered.filter((t: any) => t.user_id === currentUser.userId);
    } else if (typeof activeFilter === 'string' && activeFilter.startsWith('USER_')) {
      const selectedUserId = parseInt(activeFilter.replace('USER_', ''), 10);
      filtered = filtered.filter((t: any) => t.user_id === selectedUserId);
    } else if (typeof activeFilter === 'number') {
      filtered = filtered.filter((t: any) => t.topic_id === activeFilter);
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((t: any) => 
        (t.title && t.title.toLowerCase().includes(q)) || 
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    return filtered;
  };

  const tasks = getFilteredTasks();

  const getPriorityBadge = (priority: string = 'MEDIUM') => {
    switch (priority) {
      case 'HIGH': return <span className="badge badge-priority-HIGH">🔴 דחוף</span>;
      case 'MEDIUM': return <span className="badge badge-priority-MEDIUM">🟡 רגיל</span>;
      case 'LOW': return <span className="badge badge-priority-LOW">⚪ נמוך</span>;
      default: return <span className="badge badge-priority-MEDIUM">🟡 רגיל</span>;
    }
  };

  // Executive Flash Report Calculations
  const completedTasks = initialTasks.filter((t: any) => t.status === 'DONE');
  const stuckTasks = initialTasks.filter((t: any) => t.status === 'STUCK');
  const overdueTasks = initialTasks.filter((t: any) => t.status !== 'DONE' && t.due_date && t.due_date < todayStr);
  const urgentTasks = initialTasks.filter((t: any) => t.status !== 'DONE' && t.priority === 'HIGH');
  const inProgressTasks = initialTasks.filter((t: any) => t.status === 'IN_PROGRESS' || t.status === 'TODO');

  const handleExportCSV = () => {
    exportToCSV(initialTasks, todayStr);
  };

  const handleCopyWhatsapp = () => {
    const msg = generateExecutiveWhatsappMsg(initialTasks, todayStr);
    navigator.clipboard.writeText(msg);
    setCopiedWhatsapp(true);
    setTimeout(() => setCopiedWhatsapp(false), 3000);
  };


  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar 
        activeFilter={activeFilter} 
        setActiveFilter={setActiveFilter} 
        initialTopics={initialTopics} 
        users={users} 
        currentUser={currentUser} 
        setShowNewTopicForm={setShowNewTopicForm}
        setShowNewUserForm={setShowNewUserForm}
      />

      <MobileNav 
        activeFilter={activeFilter} 
        setActiveFilter={setActiveFilter} 
        setExpandedTaskId={setExpandedTaskId} 
        setShowNewTaskForm={setShowNewTaskForm} 
        setShowNewTopicForm={setShowNewTopicForm}
      />

      <div className="main-content">
        <div className="header">
          <h2>
            {activeFilter === 'HOME_TOPICS' && 'מסך הבית (נושאים)'}
            {activeFilter === 'DASHBOARD' && 'דשבורד ודוחות פיקוד'}
            {activeFilter === 'ALL' && 'כל המשימות'}
            {activeFilter === 'MY' && 'המשימות שלי'}
            {typeof activeFilter === 'string' && activeFilter.startsWith('USER_') && `משימות של ${approvedUsers.find((u: any) => u.id === parseInt(activeFilter.replace('USER_', ''), 10))?.name || 'חבר צוות'}`}
            {typeof activeFilter === 'number' && initialTopics.find((t: any) => t.id === activeFilter)?.title}
          </h2>
          
          <div className="header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 auto', minWidth: '200px' }}>
              <input 
                type="text" 
                placeholder="חיפוש משימות..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px 16px 8px 36px', 
                  borderRadius: '24px', 
                  border: '1px solid var(--border-color)',
                  background: 'var(--surface-color)',
                  color: 'var(--text-primary)'
                }}
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>

            <button className="btn btn-outline" onClick={toggleTheme} title="שינוי ערכת נושא" style={{ padding: '8px', borderRadius: '50%' }}>
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              )}
            </button>

            {activeFilter === 'DASHBOARD' ? (
              <>
                <button className="btn btn-outline" onClick={handleExportCSV} title="ייצוא לאקסל">
                  <Download size={16} /> אקסל (CSV)
                </button>
                <button className="btn btn-outline" onClick={handleCopyWhatsapp} title="העתק סיכום לוואטסאפ של הפיקוד">
                  {copiedWhatsapp ? <Check size={16} color="var(--success-color)" /> : <Share2 size={16} />} 
                  {copiedWhatsapp ? 'הועתק!' : 'סיכום לוואטסאפ'}
                </button>
                <button className="btn" onClick={() => window.print()}>
                  הדפס One-Pager
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-outline" onClick={() => setShowNewUserForm(true)} title="ניהול משתמשים והוספת חבר צוות" style={{ position: 'relative' }}>
                  <UserPlus size={16} /> ניהול צוות {pendingUsers.length > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger-color)', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pendingUsers.length}</span>}
                </button>
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
          {activeFilter === 'HOME_TOPICS' && (
            <TopicGrid 
              initialTopics={initialTopics} 
              initialTasks={initialTasks} 
              setActiveFilter={setActiveFilter} 
            />
          )}

          {/* New User Form & Approvals */}
          {showNewUserForm && (
            <div className="task-card" style={{ marginBottom: '16px', border: '1px solid #1a73e8', backgroundColor: '#e8f0fe', flexDirection: 'column', alignItems: 'stretch' }}>
              
              {pendingUsers.length > 0 && (
                <div style={{ marginBottom: '24px', borderBottom: '1px solid #cce0ff', paddingBottom: '16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--danger-color)', marginBottom: '12px' }}>
                    ⏳ משתמשים הממתינים לאישור ({pendingUsers.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pendingUsers.map((pUser: any) => (
                      <div key={pUser.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <div>
                          <strong style={{ fontSize: '14px' }}>{pUser.name}</strong> <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>({pUser.email})</span>
                        </div>
                        <div className="header-actions" style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn" style={{ background: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '13px' }} onClick={async () => {
                            await approveUser(pUser.id);
                            const text = `היי ${pUser.name}, חשבונך בפלטפורמת הפיקוח והבקרה של שלדור אושר בהצלחה! תוכל להיכנס למערכת כאן: https://difs.vercel.app/`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                          }}>
                            <UserCheck size={14} /> אשר ושלח עדכון WhatsApp
                          </button>
                          <button className="btn btn-outline" style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)', padding: '6px 12px', fontSize: '13px' }} onClick={async () => {
                            if(confirm('למחוק בקשת הרשמה זו לצמיתות?')) await rejectUser(pUser.id);
                          }}>
                            <UserX size={14} /> דחה ומחק
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manage Existing Users */}
              <div style={{ marginBottom: '24px', borderBottom: '1px solid #cce0ff', paddingBottom: '16px' }}>
                <div style={{ fontWeight: 600, fontSize: '15px', color: '#1a73e8', marginBottom: '12px' }}>
                  👥 ניהול משתמשים קיימים ({approvedUsers.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {approvedUsers.map((aUser: any) => (
                    <div key={aUser.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <div>
                        <strong style={{ fontSize: '14px' }}>{aUser.name}</strong> <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>({aUser.email})</span>
                        {aUser.id === currentUser.userId && <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--success-color)', fontWeight: 'bold' }}>(אתה)</span>}
                      </div>
                      <div className="header-actions" style={{ display: 'flex', gap: '8px' }}>
                        {aUser.id !== currentUser.userId && (
                          <button className="btn btn-outline" style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)', padding: '6px 12px', fontSize: '13px' }} onClick={async () => {
                            if(confirm(`האם אתה בטוח שברצונך לחסום את ${aUser.name}? המשתמש ינותק מהמערכת באופן מיידי.`)) {
                              try {
                                await revokeUserAccess(aUser.id);
                              } catch(e: any) {
                                alert(e.message);
                              }
                            }
                          }}>
                            <UserX size={14} /> חסום והסר גישה
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ fontWeight: 600, fontSize: '15px', color: '#1a73e8', marginBottom: '8px' }}>
                👤 הוספת חבר צוות ידנית
              </div>
              <form action={async (formData) => {
                const res = await createTeamMember(formData);
                if (res?.error) {
                  setUserFormMsg(res.error);
                } else {
                  setUserFormMsg('חבר הצוות נוסף בהצלחה!');
                  setTimeout(() => {
                    setShowNewUserForm(false);
                    setUserFormMsg('');
                  }, 1500);
                }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <input type="text" name="name" placeholder="שם מלא (לדוגמה: רפ&quot;ק יוסי כהן)" required />
                  <input type="email" name="email" placeholder="אימייל להתחברות" required />
                  <input type="text" name="password" defaultValue="123456" placeholder="סיסמה ראשונית (ברירת מחדל: 123456)" required />
                </div>
                {userFormMsg && (
                  <div style={{ fontSize: '13px', color: userFormMsg.includes('בהצלחה') ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: 500 }}>
                    {userFormMsg}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-outline" onClick={() => { setShowNewUserForm(false); setUserFormMsg(''); }}>ביטול</button>
                  <button type="submit" className="btn">הוסף חבר צוות</button>
                </div>
              </form>
            </div>
          )}
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
                  {approvedUsers.map((user: any) => {
                    const userTasks = initialTasks.filter((t: any) => t.user_id === user.id);
                    const pendingTasks = userTasks.filter((t: any) => t.status !== 'DONE');
                    
                    if (userTasks.length === 0) return null;
                    return (
                      <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '14px' }}>{user.name}</span>
                        <div className="header-actions" style={{ display: 'flex', gap: '8px' }}>
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
                    setIsNewTopic(false);
                  }} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input type="text" name="title" placeholder="תיאור המשימה..." required />
                    
                    {isNewTopic && (
                      <input type="text" name="newTopicTitle" placeholder="שם הנושא החדש" required />
                    )}
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                      <select name="topicId" required defaultValue={typeof activeFilter === 'number' ? activeFilter : ''} onChange={(e) => setIsNewTopic(e.target.value === 'NEW_TOPIC')}>
                        <option value="" disabled>בחר נושא</option>
                        {initialTopics.map((t: any) => <option key={t.id} value={t.id}>{t.title}</option>)}
                        <option value="NEW_TOPIC" style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>➕ נושא חדש...</option>
                      </select>
                      
                      <select name="userId" defaultValue={currentUser.userId}>
                        <option value="">ללא שיוך</option>
                        {approvedUsers.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>

                      <select name="priority" defaultValue="MEDIUM">
                        <option value="HIGH">🔴 עדיפות: דחוף</option>
                        <option value="MEDIUM">🟡 עדיפות: רגיל</option>
                        <option value="LOW">⚪ עדיפות: נמוך</option>
                      </select>

                      
                      <select name="status" defaultValue="TODO">
                        <option value="TODO">סטטוס: לביצוע</option>
                        <option value="IN_PROGRESS">סטטוס: בתהליך</option>
                        <option value="DONE">סטטוס: הושלם</option>
                        <option value="STUCK">סטטוס: תקוע</option>
                      </select>

                      <input type="date" name="dueDate" placeholder="תאריך יעד" />
                    </div>

                    <input type="url" name="driveLink" placeholder="קישור לתיקייה/קובץ בדרייב (אופציונלי)" />
                    <textarea name="description" placeholder="הערות או תיאור מורחב..." rows={2}></textarea>
                    <textarea name="progressLog" placeholder="הערת סטטוס והתקדמות שוטפת (לדוגמה: 16/08 בוצעו 4 ראיונות מתוך 10)..." rows={2}></textarea>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button type="button" className="btn btn-outline" onClick={() => { setShowNewTaskForm(false); setIsNewTopic(false); }}>ביטול</button>
                      <button type="submit" className="btn">הוסף משימה</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Task List Header (Topic Specific) */}
              {typeof activeFilter === 'number' && !showNewTaskForm && (
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                    {initialTopics.find((t: any) => t.id === activeFilter)?.title}
                  </h3>
                  <button className="btn" onClick={() => setShowNewTaskForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={16} /> הוסף משימה לנושא זה
                  </button>
                </div>
              )}

              {/* Task List */}
              <div className="task-list">
                {tasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-secondary)', background: 'white', borderRadius: '16px', border: '1px dashed #ccc' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
                    <h3 style={{ fontSize: '18px', color: '#555', marginBottom: '8px' }}>הכל נקי ומסודר!</h3>
                    <p style={{ fontSize: '14px', maxWidth: '300px', margin: '0 auto' }}>לא מצאנו משימות בתצוגה זו. תוכל תמיד להוסיף משימה חדשה דרך כפתור הפלוס למטה.</p>
                  </div>
                ) : (
                  typeof activeFilter === 'number' ? (
                    tasks.map((task: any) => <TaskCard key={task.id} task={task} initialSubtasks={initialSubtasks} initialTopics={initialTopics} approvedUsers={approvedUsers} editingTaskId={editingTaskId} setEditingTaskId={setEditingTaskId} expandedTaskId={expandedTaskId} setExpandedTaskId={setExpandedTaskId} addingSubtaskToTaskId={addingSubtaskToTaskId} setAddingSubtaskToTaskId={setAddingSubtaskToTaskId} />)
                  ) : (
                    <>
                      {initialTopics.map((topic: any) => {
                        const topicTasks = tasks.filter((t: any) => t.topic_id === topic.id);
                        if (topicTasks.length === 0) return null;
                        return (
                          <div key={`topic-group-${topic.id}`} style={{ marginBottom: '32px' }}>
                            <h3 style={{ 
                              borderBottom: '2px solid var(--primary-color)', 
                              paddingBottom: '8px', 
                              marginBottom: '16px', 
                              color: 'var(--primary-color)',
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: '18px'
                            }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>
                              {topic.title}
                            </h3>
                              {topicTasks.map((task: any) => <TaskCard key={task.id} task={task} initialSubtasks={initialSubtasks} initialTopics={initialTopics} approvedUsers={approvedUsers} editingTaskId={editingTaskId} setEditingTaskId={setEditingTaskId} expandedTaskId={expandedTaskId} setExpandedTaskId={setExpandedTaskId} addingSubtaskToTaskId={addingSubtaskToTaskId} setAddingSubtaskToTaskId={setAddingSubtaskToTaskId} />)}
                          </div>
                        );
                      })}
                      {(() => {
                        const unassignedTasks = tasks.filter((t: any) => !t.topic_id || !initialTopics.some((it: any) => it.id === t.topic_id));
                        if (unassignedTasks.length === 0) return null;
                        return (
                          <div key="unassigned-group" style={{ marginBottom: '32px' }}>
                            <h3 style={{ 
                              borderBottom: '2px solid #ccc', 
                              paddingBottom: '8px', 
                              marginBottom: '16px', 
                              color: '#555',
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: '18px'
                            }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>
                              ללא נושא ספציפי
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                              {unassignedTasks.map((task: any) => <TaskCard key={task.id} task={task} initialSubtasks={initialSubtasks} initialTopics={initialTopics} approvedUsers={approvedUsers} editingTaskId={editingTaskId} setEditingTaskId={setEditingTaskId} expandedTaskId={expandedTaskId} setExpandedTaskId={setExpandedTaskId} addingSubtaskToTaskId={addingSubtaskToTaskId} setAddingSubtaskToTaskId={setAddingSubtaskToTaskId} />)}
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}