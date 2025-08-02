'use client';

import withAuth from '../../lib/withAuth';
import Link from 'next/link';

function ParkInPage() {
  return (
    <div>
      <h1>Park a Vehicle</h1>
      <p>This is where the form to park a vehicle will go.</p>
      <Link href="/staff-dashboard">Back to Dashboard</Link>
    </div>
  );
}

export default withAuth(ParkInPage, ['operator', 'admin']);
