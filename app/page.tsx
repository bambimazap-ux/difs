import { getSession } from '@/lib/auth';
import { getTopics, getTasks, getUsers } from '@/lib/actions';
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

  return (
    <DashboardClient 
      initialTopics={topics} 
      initialTasks={tasks} 
      users={users}
      currentUser={session} 
    />
  );
}
