const fs = require('fs');
let content = fs.readFileSync('app/DashboardClient.tsx', 'utf8');

const search = \  );


        <div 
          className={\\\
av-item \\\\}
          onClick={() => setActiveFilter('ALL')}
        >
          <LayoutDashboard size={18} style={{ marginLeft: '12px' }} />
          כל המשימות
        </div>
        
        <div 
          className={\\\
av-item \\\\}
          onClick={() => setActiveFilter('MY')}
        >
          <User size={18} style={{ marginLeft: '12px' }} />
          המשימות שלי
        </div>\;

const replace = \  );

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
          className={\\\
av-item \\\\}
          onClick={() => setActiveFilter('HOME')}
        >
          <Home size={18} style={{ marginLeft: '12px' }} />
          מסך הבית (נושאים)
        </div>
        
        <div 
          className={\\\
av-item \\\\}
          onClick={() => setActiveFilter('MY')}
        >
          <User size={18} style={{ marginLeft: '12px' }} />
          המשימות שלי
        </div>

        <div 
          className={\\\
av-item \\\\}
          onClick={() => setActiveFilter('USERS')}
        >
          <Users size={18} style={{ marginLeft: '12px' }} />
          ניהול צוות
        </div>\;

content = content.replace(search, replace);
fs.writeFileSync('app/DashboardClient.tsx', content);
console.log('Fixed syntax error');
