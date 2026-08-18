const fs = require('fs');
let content = fs.readFileSync('app/DashboardClient.tsx', 'utf8');
const newRenderTask = fs.readFileSync('C:/Users/nafei/.gemini/antigravity/brain/b6bb97e9-67cd-423c-8b05-cb3c95dd09d5/scratch/render_task.txt', 'utf8');

const searchRenderTask = '  const renderTask = (task: any) => (';
const renderTaskContentEnd = '  );\\r\\n\\r\\n  return (';
const renderTaskIdxStart = content.indexOf(searchRenderTask);
const endSnippetIdx = content.indexOf('return (', renderTaskIdxStart);

if (renderTaskIdxStart === -1 || endSnippetIdx === -1) {
  console.log('Could not find renderTask boundaries');
  process.exit(1);
}

const oldRenderTaskBlock = content.substring(renderTaskIdxStart, endSnippetIdx);
content = content.replace(oldRenderTaskBlock, newRenderTask + '\n\n  ');
fs.writeFileSync('app/DashboardClient.tsx', content);
console.log('Replaced renderTask successfully');
