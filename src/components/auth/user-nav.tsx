'use client';

import { useSession } from 'next-auth/react';
import { SignOutButton } from './signout-button';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export function UserNav() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <Link href="/auth/signin">
        <Button>ログイン</Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        {session.user?.image && (
          <Image
            src={session.user.image}
            alt={session.user.name || ''}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full"
          />
        )}
        <span className="text-sm font-medium">
          {session.user?.name}
        </span>
      </div>
      <SignOutButton />
    </div>
  );
}