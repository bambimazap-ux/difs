const fs = require('fs');
let content = fs.readFileSync('app/DashboardClient.tsx', 'utf8');

// 1. Sidebar items (desktop) - update to standard structure
const oldSidebar = \          <div className={\\\sidebar-item \\\\} onClick={() => setActiveFilter('DASHBOARD')}>
            <BarChart size={18} />
            <span>דשבורד ודוחות</span>
          </div>
          <div className={\\\sidebar-item \\\\} onClick={() => setActiveFilter('ALL')}>
            <LayoutDashboard size={18} />
            <span>כל המשימות</span>
          </div>
          <div className={\\\sidebar-item \\\\} onClick={() => setActiveFilter('MY')}>
            <User size={18} />
            <span>המשימות שלי</span>
          </div>\;

const newSidebar = \          <div className={\\\sidebar-item \\\\} onClick={() => setActiveFilter('HOME')}>
            <Home size={18} />
            <span>מסך הבית (נושאים)</span>
          </div>
          <div className={\\\sidebar-item \\\\} onClick={() => setActiveFilter('MY')}>
            <User size={18} />
            <span>המשימות שלי</span>
          </div>
          <div className={\\\sidebar-item \\\\} onClick={() => setActiveFilter('USERS')}>
            <Users size={18} />
            <span>ניהול צוות</span>
          </div>\;

content = content.replace(oldSidebar, newSidebar);

// 2. Main Content Header
const headerSearch = '      {/* Main Content */}';
const mainAreaStr = content.substring(content.indexOf(headerSearch));

// Write to temp file for manual review
fs.writeFileSync('app/DashboardClient.tsx', content);
console.log('Sidebar patched.');
