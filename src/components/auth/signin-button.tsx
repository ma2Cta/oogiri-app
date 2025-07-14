'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function SignInButton() {
  const handleSignIn = async () => {
    // 本番環境とローカル環境で統一した動作
    await signIn('google', { callbackUrl: '/' });
  };

  return (
    <Button 
      onClick={handleSignIn}
      className="w-full"
    >
      Googleでログイン
    </Button>
  );
}