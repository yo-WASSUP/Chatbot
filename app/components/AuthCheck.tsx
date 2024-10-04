'use client'

import { useAuth } from '../hooks/useAuth';
import { ReactNode, memo } from 'react';

function AuthCheck({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>You must be logged in</div>;
  }

  return <>{children}</>;
}

export default memo(AuthCheck);