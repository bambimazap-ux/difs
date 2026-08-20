import { LayoutDashboard, Users, LogOut, CheckCircle2, Download, ExternalLink } from 'lucide-react';
import { logout } from '@/lib/actions';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function Sidebar({ 
  activeFilter, 
  setActiveFilter, 
  initialTopics, 
  users, 
  currentUser,
  setShowNewTopicForm,
  setShowNewUserForm
}: any) {
  const { isInstallable, installPWA } = usePWAInstall();
  return (
    <>
      <div className="drawer-overlay" onClick={() => {
        document.querySelector('.sidebar')?.classList.remove('mobile-open');
        document.querySelector('.drawer-overlay')?.classList.remove('active');
      }}></div>
      <div className="sidebar">
        <div style={{ padding: '24px', fontSize: '20px', fontWeight: 'bold', color: 'var(--primary-color)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          שליטה ובקרה
        </div>
        <div style={{ padding: '16px' }}>
          <div style={{ fontSize: '13px', color: '#9aa0a6', marginBottom: '8px', paddingRight: '12px' }}>ראשי</div>
          <ul className="nav-menu">
            <li className={activeFilter === 'HOME_TOPICS' ? 'active' : ''} onClick={() => {
                setActiveFilter('HOME_TOPICS');
                document.querySelector('.sidebar')?.classList.remove('mobile-open');
                document.querySelector('.drawer-overlay')?.classList.remove('active');
            }}>
              <LayoutDashboard size={20} /> בית (נושאים)
            </li>
            <li className={activeFilter === 'ALL' ? 'active' : ''} onClick={() => {
                setActiveFilter('ALL');
                document.querySelector('.sidebar')?.classList.remove('mobile-open');
                document.querySelector('.drawer-overlay')?.classList.remove('active');
            }}>
              <LayoutDashboard size={20} /> כל המשימות
            </li>
            <li className={activeFilter === 'MY' ? 'active' : ''} onClick={() => {
                setActiveFilter('MY');
                document.querySelector('.sidebar')?.classList.remove('mobile-open');
                document.querySelector('.drawer-overlay')?.classList.remove('active');
            }}>
              <CheckCircle2 size={20} /> משימות שלי
            </li>
            <li className={activeFilter === 'USERS' ? 'active' : ''} onClick={() => {
                setActiveFilter('USERS');
                document.querySelector('.sidebar')?.classList.remove('mobile-open');
                document.querySelector('.drawer-overlay')?.classList.remove('active');
            }}>
              <Users size={20} /> ניהול משתמשים
            </li>
            <li>
              <a 
                href="https://drive.google.com/drive/folders/1NMq5a8InOdfhupnxYf77byoRdmzxJd8B?usp=sharing"
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit', width: '100%' }}
              >
                <ExternalLink size={20} style={{ color: '#1fa463' }} /> 
                תיקיית פרויקט (Drive)
              </a>
            </li>
          </ul>
        </div>
        
        {/* Mobile-only actions in drawer */}
        <div className="mobile-only" style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '13px', color: '#9aa0a6', marginBottom: '8px', paddingRight: '12px' }}>פעולות</div>
            <ul className="nav-menu">
              <li onClick={() => { setShowNewTopicForm(true); document.querySelector('.sidebar')?.classList.remove('mobile-open'); document.querySelector('.drawer-overlay')?.classList.remove('active'); }}>
                נושא חדש
              </li>
              {isInstallable && (
                <li onClick={installPWA} style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                  <Download size={20} /> התקן כאפליקציה
                </li>
              )}
            </ul>
        </div>
        
        <div style={{ marginTop: 'auto', padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              {currentUser.name ? currentUser.name[0] : 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 'bold' }}>{currentUser.name}</div>
              <div style={{ fontSize: '12px', color: '#9aa0a6' }}>{currentUser.role === 'ADMIN' ? 'מנהל' : 'צוות'}</div>
            </div>
          </div>
          <form action={logout}>
            <button className="btn btn-outline" style={{ width: '100%', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
              <LogOut size={16} /> התנתק
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
