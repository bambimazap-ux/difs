import { useState, useEffect, useRef } from 'react';
import { Home, BarChart, Plus, User, Menu, FolderPlus, CheckSquare } from 'lucide-react';

export default function MobileNav({ 
  activeFilter, 
  setActiveFilter, 
  setExpandedTaskId, 
  setShowNewTaskForm,
  setShowNewTopicForm
}: any) {
  const [showFabMenu, setShowFabMenu] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setShowFabMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {showFabMenu && (
        <div 
          className="fab-overlay" 
          onClick={() => setShowFabMenu(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
        />
      )}
      
      <div className="mobile-bottom-nav">
        <div 
          className={`nav-icon ${activeFilter === 'HOME_TOPICS' ? 'active' : ''}`} 
          onClick={() => {
            setActiveFilter('HOME_TOPICS');
            setExpandedTaskId(null);
          }}
        >
          <Home size={24} />
          <span>בית</span>
        </div>
        
        <div 
          className={`nav-icon ${activeFilter === 'DASHBOARD' ? 'active' : ''}`} 
          onClick={() => setActiveFilter('DASHBOARD')}
        >
          <BarChart size={24} />
          <span>דשבורד</span>
        </div>
        
        <div className="nav-icon fab-container" ref={fabRef}>
          {showFabMenu && (
            <div className="fab-menu premium-shadow" style={{ 
              position: 'absolute', 
              bottom: '80px', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              background: 'white', 
              borderRadius: '16px', 
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              width: '180px',
              zIndex: 1000
            }}>
              <div 
                className="fab-menu-item"
                onClick={() => { setActiveFilter('HOME_TOPICS'); setShowNewTaskForm(true); setShowFabMenu(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', cursor: 'pointer', borderRadius: '8px', background: '#f8f9fa' }}
              >
                <CheckSquare size={18} color="var(--primary-color)" />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>משימה חדשה</span>
              </div>
              <div 
                className="fab-menu-item"
                onClick={() => { setActiveFilter('HOME_TOPICS'); if(setShowNewTopicForm) setShowNewTopicForm(true); setShowFabMenu(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', cursor: 'pointer', borderRadius: '8px', background: '#f8f9fa' }}
              >
                <FolderPlus size={18} color="var(--primary-color)" />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>נושא חדש</span>
              </div>
            </div>
          )}
          
          <div 
            onClick={() => setShowFabMenu(!showFabMenu)}
            style={{ 
              background: showFabMenu ? '#1557b0' : 'var(--primary-color)', 
              borderRadius: '50%', 
              padding: '12px', 
              color: 'white', 
              marginTop: '-20px', 
              boxShadow: '0 4px 12px rgba(26,115,232,0.3)',
              transform: showFabMenu ? 'rotate(45deg)' : 'rotate(0deg)',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer'
            }}
          >
            <Plus size={28} />
          </div>
        </div>
        
        <div 
          className={`nav-icon ${activeFilter === 'MY' ? 'active' : ''}`} 
          onClick={() => setActiveFilter('MY')}
        >
          <User size={24} />
          <span>שלי</span>
        </div>

        <div className="nav-icon" onClick={() => {
          document.querySelector('.sidebar')?.classList.toggle('mobile-open');
          document.querySelector('.drawer-overlay')?.classList.toggle('active');
        }}>
          <Menu size={24} />
          <span>תפריט</span>
        </div>
      </div>
    </>
  );
}
