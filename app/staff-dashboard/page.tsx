'use client';

import { useRouter } from 'next/navigation';
import withAuth from '../../lib/withAuth';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  role: string;
}

interface StaffDashboardPageProps {
  user: User;
}

function StaffDashboardPage({ user }: StaffDashboardPageProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('jwt-token');
    router.push('/login');
  };

  return (
    <div>
      <h1>Staff Dashboard</h1>
      <p>Welcome, {user.username}!</p>
      <p>Your Role: {user.role}</p>
      
      <nav>
        <ul>
          <li><Link href="/parkin">Park a Vehicle</Link></li>
          <li><Link href="/parkout">Check-out a Vehicle</Link></li>
        </ul>
      </nav>

      {user.role === 'admin' && (
        <div>
          <h2>Admin Controls</h2>
          <nav>
            <ul>
              <li><Link href="/revenue">View Revenue</Link></li>
              <li><Link href="/overstay">View Overstaying Vehicles</Link></li>
            </ul>
          </nav>
        </div>
      )}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default withAuth(StaffDashboardPage, ['operator', 'admin']);
