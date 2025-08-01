'use client';

import withAuth from '../../lib/withAuth';
import Link from 'next/link';

function RevenuePage() {
  return (
    <div>
      <h1>Revenue Report</h1>
      <p>This is where the revenue report will be displayed.</p>
      <Link href="/staff-dashboard">Back to Dashboard</Link>
    </div>
  );
}

export default withAuth(RevenuePage, ['admin']);
