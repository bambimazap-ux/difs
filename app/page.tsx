import { getSession } from '@/lib/auth';
import { getTopics, getTasks, getUsers, getSubtasks } from '@/lib/actions';
import DashboardClient from './DashboardClient';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  const topics = await getTopics();
  const tasks = await getTasks();
  const users = await getUsers();
  const subtasks = await getSubtasks();

  const dbUser = users.find((u: any) => u.id === session.userId);
  if (!dbUser || dbUser.is_approved === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>הגישה שלך נחסמה או הוסרה</h2>
        <p>פנה למנהל המערכת לבירור.</p>
        <form action={async () => {
          "use server";
          const { deleteSession } = await import('@/lib/auth');
          await deleteSession();
          redirect('/login');
        }}>
          <button style={{ marginTop: '20px', padding: '10px 20px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            התנתק מהמערכת
          </button>
        </form>
      </div>
    );
  }

  return (
    <DashboardClient 
      initialTopics={topics} 
      initialTasks={tasks} 
      initialSubtasks={subtasks}
      users={users}
      currentUser={session} 
    />
  );
}
