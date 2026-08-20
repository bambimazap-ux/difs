import re

with open('app/DashboardClient.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'(<select name="priority"[^>]*>.*?<\/select>\s*)(<input type="date"[^>]*>\s*<\/div>\s*<input type="url"[^>]*>)'

replacement = r'''\1
                      <select name="status" defaultValue="TODO">
                        <option value="TODO">סטטוס: לביצוע</option>
                        <option value="IN_PROGRESS">סטטוס: בתהליך</option>
                        <option value="DONE">סטטוס: הושלם</option>
                        <option value="STUCK">סטטוס: תקוע</option>
                      </select>

                      \2
                    <textarea name="description" placeholder="הערות או תיאור מורחב..." rows={2}></textarea>
                    <textarea name="progressLog" placeholder="הערת סטטוס והתקדמות שוטפת (לדוגמה: 16/08 בוצעו 4 ראיונות מתוך 10)..." rows={2}></textarea>'''

new_content, count = re.subn(pattern, replacement, content, flags=re.DOTALL)

if count > 0:
    with open('app/DashboardClient.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Updated DashboardClient.tsx successfully')
else:
    print('Regex pattern not found!')
