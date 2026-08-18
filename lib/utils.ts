export function exportToCSV(tasks: any[], todayStr: string) {
  const headers = ['מספר', 'משימה', 'נושא', 'אחראי', 'סטטוס', 'עדיפות', 'תאריך יעד', 'הערת התקדמות', 'קישור דרייב'];
  const rows = tasks.map((t: any) => [
    t.id,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${(t.topic_title || '').replace(/"/g, '""')}"`,
    `"${(t.user_name || 'טרם שויך').replace(/"/g, '""')}"`,
    t.status === 'DONE' ? 'בוצע' : t.status === 'IN_PROGRESS' ? 'בתהליך' : t.status === 'STUCK' ? 'תקוע' : 'לביצוע',
    t.priority === 'HIGH' ? 'דחוף' : t.priority === 'LOW' ? 'נמוך' : 'רגיל',
    t.due_date || '',
    `"${(t.progress_log || t.description || '').replace(/"/g, '""')}"`,
    t.drive_link || ''
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `shaldor_tasks_report_${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateExecutiveWhatsappMsg(tasks: any[], todayStr: string): string {
  const completedTasks = tasks.filter((t: any) => t.status === 'DONE');
  const stuckTasks = tasks.filter((t: any) => t.status === 'STUCK');
  const overdueTasks = tasks.filter((t: any) => t.status !== 'DONE' && t.due_date && t.due_date < todayStr);
  const urgentTasks = tasks.filter((t: any) => t.status !== 'DONE' && t.priority === 'HIGH');
  const inProgressTasks = tasks.filter((t: any) => t.status === 'IN_PROGRESS' || t.status === 'TODO');

  let msg = `📊 *סטטוס שבועי - ניהול משימות שלדור*\n`;
  msg += `תאריך: ${todayStr}\n\n`;

  msg += `✅ *מה הושלם לאחרונה:*\n`;
  if (completedTasks.length === 0) msg += `אין משימות שסומנו כהושלמו.\n`;
  else {
    completedTasks.slice(0, 5).forEach((t: any) => {
      msg += `• ${t.title} (${t.user_name || 'ללא שיוך'})\n`;
    });
  }

  msg += `\n⚠️ *צווארי בקבוק וחריגות:*\n`;
  const issues = [...stuckTasks, ...overdueTasks.filter((o: any) => !stuckTasks.some((s: any) => s.id === o.id))];
  if (issues.length === 0) msg += `אין חריגות או משימות תקועות 🎉\n`;
  else {
    issues.forEach((t: any) => {
      msg += `• ${t.title} [${t.status === 'STUCK' ? 'תקוע' : 'באיחור'}] - אחראי: ${t.user_name || 'לא שויך'}\n`;
    });
  }

  msg += `\n🎯 *יעדים מרכזיים לשבוע הבא:*\n`;
  const focusTasks = urgentTasks.length > 0 ? urgentTasks : inProgressTasks.slice(0, 5);
  if (focusTasks.length === 0) msg += `אין משימות דחופות פתוחות.\n`;
  else {
    focusTasks.forEach((t: any) => {
      msg += `• ${t.title} (${t.user_name || 'לא שויך'})${t.due_date ? ' - יעד: ' + t.due_date : ''}\n`;
    });
  }

  msg += `\n🔗 *לכניסה למערכת:* https://difs.vercel.app/\n`;
  return msg;
}
