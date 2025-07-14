import { Button } from '@/components/ui/button';

// 本番環境専用のサーバーアクション対応サインインボタン
async function signInAction() {
  'use server';
  const { redirect } = await import('next/navigation');
  redirect('/api/auth/signin/google?callbackUrl=/');
}

export function ProductionSignInButton() {
  return (
    <form action={signInAction}>
      <Button 
        type="submit"
        className="w-full"
      >
        Googleでログイン
      </Button>
    </form>
  );
}