import re

with open('app/components/TaskCard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern1 = r'\{task\.description && \(\s*<div style={{ marginTop: \'16px\', fontSize: \'14px\', lineHeight: \'1\.5\' }}>\s*<strong>תיאור מלא:<\/strong><br\/>\s*\{task\.description\}\s*<\/div>\s*\)\}'
replacement1 = r'''          <div style={{ marginTop: '16px', fontSize: '14px', lineHeight: '1.5' }}>
            <strong>תיאור מלא:</strong><br/>
            {task.description || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>אין תיאור למשימה זו (לחץ ערוך להוספה)</span>}
          </div>'''

pattern2 = r'\{task\.progress_log && \(\s*<div style={{ marginTop: \'16px\', fontSize: \'14px\', lineHeight: \'1\.5\', background: \'#e8f0fe\', padding: \'12px\', borderRadius: \'8px\', color: \'#1a73e8\' }}>\s*<strong>יומן התקדמות / סטטוס:<\/strong><br\/>\s*\{task\.progress_log\}\s*<\/div>\s*\)\}'
replacement2 = r'''          <div style={{ marginTop: '16px', fontSize: '14px', lineHeight: '1.5', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <strong>יומן התקדמות / סטטוס:</strong><br/>
            {task.progress_log || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>אין הערות סטטוס</span>}
          </div>'''

# We also should fix the background color for progress log in Dark Mode. Instead of hardcoded #e8f0fe, I used var(--bg-secondary).

content = re.sub(pattern1, replacement1, content)
content = re.sub(pattern2, replacement2, content)

with open('app/components/TaskCard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated TaskCard empty states successfully')
