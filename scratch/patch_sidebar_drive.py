import re

with open('app/components/Sidebar.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { LayoutDashboard, Users, LogOut, CheckCircle2, Download }", "import { LayoutDashboard, Users, LogOut, CheckCircle2, Download, ExternalLink }")

pattern = r'''(            <li className=\{activeFilter === 'USERS' \? 'active' : ''\} onClick=\{\(\) => \{
                setActiveFilter\('USERS'\);
                document.querySelector\('\.sidebar'\)\?\.classList\.remove\('mobile-open'\);
                document.querySelector\('\.drawer-overlay'\)\?\.classList\.remove\('active'\);
            \}\}>
              <Users size=\{20\} \/> ניהול משתמשים
            <\/li>)'''

replacement = r'''\1
            <li>
              <a 
                href="https://drive.google.com/drive/folders/1NMq5a8InOdfhupnxYf77byoRdmzxJd8B?usp=sharing"
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit', width: '100%' }}
              >
                <ExternalLink size={20} style={{ color: '#1fa463' }} /> 
                תיקיית פרויקט (Drive)
              </a>
            </li>'''

content = re.sub(pattern, replacement, content)

with open('app/components/Sidebar.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated Sidebar with Drive link successfully')
