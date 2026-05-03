import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  return (
    <div data-testid="dashboard-page" className="card">
      <h1>Welcome back</h1>
      <p>
        Signed in as{' '}
        <span data-testid="dashboard-user-name">{session.name}</span> (
        <span data-testid="dashboard-user-email">{session.email}</span>)
      </p>
      <p>
        <a href="/bookmarks/new" data-testid="dashboard-new-bookmark">
          Add a new bookmark →
        </a>
      </p>
      <form action="/api/auth/logout" method="post">
        <button type="submit" className="primary" data-testid="logout-button">
          Sign out
        </button>
      </form>
    </div>
  );
}
