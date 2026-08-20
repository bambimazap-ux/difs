import re

with open('lib/actions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('ORDER BY tasks.created_at DESC', "ORDER BY CASE WHEN tasks.status = 'DONE' THEN 1 ELSE 0 END, tasks.created_at DESC")

with open('lib/actions.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated actions.ts ORDER BY successfully')
