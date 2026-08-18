const fs = require('fs');
let content = fs.readFileSync('app/DashboardClient.tsx', 'utf8');

// 1. Imports
content = content.replace('Calendar, AlertTriangle, Download, Copy, Check, Share2, UserPlus, UserCheck, UserX, CheckSquare, Square', 'Calendar, AlertTriangle, Download, Copy, Check, Share2, UserPlus, UserCheck, UserX, CheckSquare, Square, Menu, Home, Users, ChevronDown, ChevronRight');

// 2. States
content = content.replace("const [activeFilter, setActiveFilter] = useState<number | 'ALL' | 'MY' | 'DASHBOARD'>('ALL');", \const [activeFilter, setActiveFilter] = useState<number | 'HOME' | 'MY' | 'USERS'>('HOME');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'DONE'>('OPEN');
  const [showFabMenu, setShowFabMenu] = useState(false);\);

// 3. getFilteredTasks
const oldGetFilteredTasks = \  const getFilteredTasks = () => {
    let filtered = initialTasks;
    if (activeFilter === 'MY') {
      filtered = filtered.filter((t: any) => t.user_id === currentUser.userId);
    } else if (typeof activeFilter === 'string' && activeFilter.startsWith('USER_')) {
      const selectedUserId = parseInt(activeFilter.replace('USER_', ''), 10);
      filtered = filtered.filter((t: any) => t.user_id === selectedUserId);
    } else if (typeof activeFilter === 'number') {
      filtered = filtered.filter((t: any) => t.topic_id === activeFilter);
    }
    return filtered;
  };\;

const newGetFilteredTasks = \  const getFilteredTasks = () => {
    let filtered = initialTasks;
    if (activeFilter === 'MY') {
      filtered = filtered.filter((t: any) => t.user_id === currentUser.userId);
    } else if (typeof activeFilter === 'string' && activeFilter.startsWith('USER_')) {
      const selectedUserId = parseInt(activeFilter.replace('USER_', ''), 10);
      filtered = filtered.filter((t: any) => t.user_id === selectedUserId);
    } else if (typeof activeFilter === 'number') {
      filtered = filtered.filter((t: any) => t.topic_id === activeFilter);
    }
    
    if (statusFilter === 'OPEN') {
      filtered = filtered.filter((t: any) => t.status !== 'DONE' && t.status !== 'CANCELLED');
    } else if (statusFilter === 'DONE') {
      filtered = filtered.filter((t: any) => t.status === 'DONE');
    }
    
    return filtered;
  };\;
content = content.replace(oldGetFilteredTasks, newGetFilteredTasks);

fs.writeFileSync('app/DashboardClient.tsx', content);
console.log('Phase 1 done');
