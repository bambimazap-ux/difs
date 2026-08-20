import re

with open('app/components/MobileNav.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("onClick={() => { setShowNewTaskForm(true); setShowFabMenu(false); }}", "onClick={() => { setActiveFilter('HOME_TOPICS'); setShowNewTaskForm(true); setShowFabMenu(false); }}")
content = content.replace("onClick={() => { if(setShowNewTopicForm) setShowNewTopicForm(true); setShowFabMenu(false); }}", "onClick={() => { setActiveFilter('HOME_TOPICS'); if(setShowNewTopicForm) setShowNewTopicForm(true); setShowFabMenu(false); }}")

with open('app/components/MobileNav.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated MobileNav successfully')
