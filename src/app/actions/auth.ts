'use server';

import { redirect } from 'next/navigation';
import { getSignOutUrl, logAuthError } from '@/lib/auth-utils';

/**
 * サインアウトサーバーアクション
 * 全環境で共通の動作
 */
export async function signOutAction() {
  try {
    const redirectUrl = getSignOutUrl('/');
    redirect(redirectUrl);
  } catch (error) {
    logAuthError('signOutAction', error);
    throw new Error('Sign out failed. Please try again.');
  }
}