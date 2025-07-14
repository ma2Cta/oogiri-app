'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

interface SignOutButtonProps {
  children?: React.ReactNode;
}

export function SignOutButton({ children }: SignOutButtonProps) {
  return (
    <Button 
      onClick={() => signOut({ callbackUrl: '/' })}
      variant="outline"
    >
      {children || 'ログアウト'}
    </Button>
  );
}