'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  role: string;
}

const withAuth = (WrappedComponent: React.ComponentType<any>, allowedRoles: string[]) => {
  const AuthComponent = (props: any) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      const verifyToken = async () => {
        const token = localStorage.getItem('jwt-token');
        if (!token) {
          router.replace('/login');
          return;
        }

        try {
          const res = await fetch('/api/auth/verify', {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (!res.ok) {
            throw new Error('Session expired or invalid.');
          }

          const data = await res.json();
          
          if (!allowedRoles.includes(data.user.role)) {
            alert('Access Denied: You do not have permission to view this page.');
            router.replace('/staff-dashboard'); 
          } else {
            setUser(data.user);
          }
        } catch (err) {
          localStorage.removeItem('jwt-token');
          router.replace('/login');
        } finally {
          setLoading(false);
        }
      };

      verifyToken();
    }, [router]);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!user) {
      return null; 
    }

    return <WrappedComponent {...props} user={user} />;
  };

  return AuthComponent;
};

export default withAuth;
