const fs = require('fs');
let content = fs.readFileSync('app/DashboardClient.tsx', 'utf8');

// 1. Replace the Mobile Bottom Nav
const searchNav = '      {/* --- Mobile Bottom Navigation --- */}';
const endNav = '      {/* Main Content */}';
const startIdxNav = content.indexOf(searchNav);
const endIdxNav = content.indexOf(endNav);

if (startIdxNav === -1 || endIdxNav === -1) {
  console.log('Could not find mobile nav block');
  process.exit(1);
}

const oldNav = content.substring(startIdxNav, endIdxNav);

const newNav = \      {/* --- Mobile Bottom Navigation --- */}
      <div className="mobile-bottom-nav">
        <div className={\\\
av-icon \\\\} onClick={() => setActiveFilter('HOME')}>
          <Home size={24} />
          <span>בית</span>
        </div>
        
        <div className={\\\
av-icon \\\\} onClick={() => setActiveFilter('MY')}>
          <User size={24} />
          <span>שלי</span>
        </div>
        
        <div className="fab-container">
          <div className={\\\ab-menu \\\\}>
            <button className="fab-menu-item" onClick={() => { setShowNewTopicForm(true); setShowFabMenu(false); }}>
              <Folder size={18} /> נושא חדש
            </button>
            <button className="fab-menu-item" onClick={() => { setShowNewTaskForm(true); setShowFabMenu(false); }}>
              <CheckSquare size={18} /> משימה חדשה
            </button>
          </div>
          <button className="fab-button" onClick={() => setShowFabMenu(!showFabMenu)}>
            <Plus size={28} color="white" style={{ transform: showFabMenu ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {showFabMenu && <div className="fab-overlay" onClick={() => setShowFabMenu(false)}></div>}
        </div>

        <div className={\\\
av-icon \\\\} onClick={() => setActiveFilter('USERS')}>
          <Users size={24} />
          <span>צוות</span>
        </div>
        
        <div className="nav-icon" onClick={() => {
          document.querySelector('.sidebar')?.classList.toggle('mobile-open');
          document.querySelector('.drawer-overlay')?.classList.toggle('active');
        }}>
          <Menu size={24} />
          <span>תפריט</span>
        </div>
      </div>

\;

content = content.replace(oldNav, newNav);

// 2. Add Status Filter Tabs before the Task List
const taskListStr = '              {/* Task List */}';
const filterTabs = \              {/* Status Filter Tabs */}
              {!showNewTaskForm && !showNewTopicForm && activeFilter !== 'USERS' && (
                <div className="status-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', overflowX: 'auto' }}>
                  <button 
                    className={\\\tn \\\\} 
                    onClick={() => setStatusFilter('OPEN')}
                    style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
                  >
                    פתוחות
                  </button>
                  <button 
                    className={\\\tn \\\\} 
                    onClick={() => setStatusFilter('DONE')}
                    style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
                  >
                    הושלמו
                  </button>
                  <button 
                    className={\\\tn \\\\} 
                    onClick={() => setStatusFilter('ALL')}
                    style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
                  >
                    הכל
                  </button>
                </div>
              )}
              
\;

content = content.replace(taskListStr, filterTabs + taskListStr);

// 3. Update the Header titles logic
const oldHeaderTitle = \          <h2>
            {activeFilter === 'DASHBOARD' && 'דשבורד ודוחות פיקוד'}
            {activeFilter === 'ALL' && 'כל המשימות'}
            {activeFilter === 'MY' && 'המשימות שלי'}
            {typeof activeFilter === 'string' && activeFilter.startsWith('USER_') && \משימות של \\}
            {typeof activeFilter === 'number' && initialTopics.find((t: any) => t.id === activeFilter)?.title}
          </h2>\;
          
const newHeaderTitle = \          <h2>
            {activeFilter === 'HOME' && 'מסך הבית (נושאים)'}
            {activeFilter === 'USERS' && 'ניהול צוות'}
            {activeFilter === 'MY' && 'המשימות שלי'}
            {typeof activeFilter === 'string' && activeFilter.startsWith('USER_') && \משימות של \\}
            {typeof activeFilter === 'number' && initialTopics.find((t: any) => t.id === activeFilter)?.title}
          </h2>\;

content = content.replace(oldHeaderTitle, newHeaderTitle);

// 4. Update the content routing to show Users when activeFilter === 'USERS'
// Currently, USERS management uses showNewUserForm state. Let's make activeFilter === 'USERS' trigger it.
// We will replace \{showNewUserForm && (\ with \{(showNewUserForm || activeFilter === 'USERS') && (\
content = content.replace('{showNewUserForm && (', '{(showNewUserForm || activeFilter === \\'USERS\\') && (');

fs.writeFileSync('app/DashboardClient.tsx', content);
console.log('UI structure replaced successfully');
