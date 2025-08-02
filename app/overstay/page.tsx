'use client';

import withAuth from '../../lib/withAuth';
import Link from 'next/link';

function OverstayPage() {
  return (
    <div>
      <h1>Overstaying Vehicles</h1>
      <p>This is where the list of overstaying vehicles will be displayed.</p>
      <Link href="/staff-dashboard">Back to Dashboard</Link>
    </div>
  );
}

export default withAuth(OverstayPage, ['admin']);
