import re

with open('app/components/TaskCard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'''(          <div style={{ marginTop: '16px', fontSize: '14px', lineHeight: '1\.5', background: 'var\(--bg-secondary\)', padding: '12px', borderRadius: '8px', border: '1px solid var\(--border-color\)' }}>
            <strong>יומן התקדמות / סטטוס:<\/strong><br\/>
            \{task\.progress_log \|\| <span style={{ color: 'var\(--text-secondary\)', fontStyle: 'italic' }}>אין הערות סטטוס<\/span>\}
          <\/div>)'''

replacement = r'''\1
          {task.drive_link && (
            <div style={{ marginTop: '16px' }}>
              <a href={task.drive_link} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#e8f0fe', color: '#1a73e8', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                <Link size={18} /> פתח קישור דרייב / מצורף
              </a>
            </div>
          )}'''

new_content, count = re.subn(pattern, replacement, content, flags=re.DOTALL)

if count > 0:
    with open('app/components/TaskCard.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Updated TaskCard Drive link successfully')
else:
    print('Pattern for Drive link not found')
