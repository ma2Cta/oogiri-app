'use server';

// NextAuth v4でのサーバーアクション対応版
// クライアント側のsignIn/signOutをフォームから呼び出すためのブリッジ関数

export async function signInWithGoogle() {
  // 本番環境では直接リダイレクト、開発環境ではフォームフローを使用
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // 本番環境：直接リダイレクト（Cloud Runなどでの問題回避）
    const { redirect } = await import('next/navigation');
    redirect('/api/auth/signin/google?callbackUrl=/');
  } else {
    // 開発環境：通常のNextAuthフローを使用
    throw new Error('Use client-side signIn for development');
  }
}

export async function signOutAction() {
  // サインアウトは環境に関係なく直接リダイレクト
  const { redirect } = await import('next/navigation');
  redirect('/api/auth/signout?callbackUrl=/');
}