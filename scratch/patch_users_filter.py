import re

with open('app/DashboardClient.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('{showNewUserForm && (', '{(showNewUserForm || activeFilter === \'USERS\') && (')

with open('app/DashboardClient.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated DashboardClient for USERS successfully')
