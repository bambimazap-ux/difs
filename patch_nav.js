const fs = require('fs');
const content = fs.readFileSync('app/DashboardClient.tsx', 'utf8');
const search = '      {/* Main Content */}';
const replacement = \
      <div 
        className="drawer-overlay" 
        onClick={() => document.querySelector('.sidebar')?.classList.remove('mobile-open')}
      ></div>

      {/* --- Mobile Bottom Navigation --- */}
      <div className="mobile-bottom-nav">
        <div className={\\\
av-icon \\\\} onClick={() => setActiveFilter('DASHBOARD')}>
          <BarChart size={24} />
          <span>דשבורד</span>
        </div>
        <div className={\\\
av-icon \\\\} onClick={() => setActiveFilter('ALL')}>
          <LayoutDashboard size={24} />
          <span>הכל</span>
        </div>
        
        <div className="fab-container">
          <button className="fab-button" onClick={() => setShowNewTaskForm(true)}>
            <Plus size={28} color="white" />
          </button>
        </div>

        <div className={\\\
av-icon \\\\} onClick={() => setActiveFilter('MY')}>
          <User size={24} />
          <span>שלי</span>
        </div>
        {/* Toggle Sidebar/Drawer for Topics & Settings */}
        <div className="nav-icon" onClick={() => {
          document.querySelector('.sidebar')?.classList.toggle('mobile-open');
          document.querySelector('.drawer-overlay')?.classList.toggle('active');
        }}>
          <Folder size={24} />
          <span>נושאים</span>
        </div>
      </div>

      {/* Main Content */}
\;
if (content.includes(search)) {
  fs.writeFileSync('app/DashboardClient.tsx', content.replace(search, replacement));
  console.log('Patched DashboardClient.tsx');
} else {
  console.log('Search string not found');
}
