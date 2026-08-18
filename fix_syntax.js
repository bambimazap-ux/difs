const fs = require('fs');
let content = fs.readFileSync('app/DashboardClient.tsx', 'utf8');

const regex = /  \};\r?\n[\s\S]*?(?=\s*<div\s+className="app-container">)/;
const replacement = \  };

  return (
\;

content = content.replace(regex, replacement);
fs.writeFileSync('app/DashboardClient.tsx', content);
console.log('Fixed syntax error');
