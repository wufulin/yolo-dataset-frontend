'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, requiresAuth } from '@/lib/auth-simple';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const currentPath = window.location.pathname;
      
      // If authentication is required but not authenticated, redirect to login page
      if (requiresAuth(currentPath) && !isAuthenticated()) {
        const redirect = encodeURIComponent(currentPath);
        router.push(`/auth/login?redirect=${redirect}`);
        return;
      }
      
      // If authenticated and on login page, redirect to dashboard
      if (currentPath.startsWith('/auth/login') && isAuthenticated()) {
        router.push('/dashboard');
        return;
      }
      
      setChecking(false);
    };

    // Delayed check to ensure component is fully loaded
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Checking authentication status...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
