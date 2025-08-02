'use client';

import withAuth from '../../lib/withAuth';
import Link from 'next/link';

function ParkOutPage() {
  return (
    <div>
      <h1>Check-out a Vehicle</h1>
      <p>This is where the form to check-out a vehicle will go.</p>
      <Link href="/staff-dashboard">Back to Dashboard</Link>
    </div>
  );
}

export default withAuth(ParkOutPage, ['operator', 'admin']);
