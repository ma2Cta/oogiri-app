'use server';

import { redirect } from 'next/navigation';
import { 
  isProduction, 
  getAuthRedirectUrl, 
  getSignOutUrl, 
  logAuthError, 
  logDevAuthWarning 
} from '@/lib/auth-utils';

/**
 * 本番環境対応のGoogleサインインサーバーアクション
 * 開発環境では適切なエラーメッセージを返し、
 * 本番環境ではサーバーアクションによるリダイレクトを実行
 */
export async function signInWithGoogle() {
  try {
    if (isProduction()) {
      // 本番環境：サーバーアクションによるリダイレクト（Cloud Run対応）
      const redirectUrl = getAuthRedirectUrl('google', '/');
      redirect(redirectUrl);
    } else {
      // 開発環境：適切なメッセージでクライアント側認証を促す
      const message = 'Development environment detected. Please use client-side signIn for local development.';
      logDevAuthWarning(message);
      
      // 開発環境では例外を投げる代わりに、適切なエラー応答を返す
      throw new Error('DEV_ENV_CLIENT_AUTH_REQUIRED');
    }
  } catch (error) {
    logAuthError('signInWithGoogle', error);
    
    // 開発環境の場合は特定のエラーを再スロー
    if (error instanceof Error && error.message === 'DEV_ENV_CLIENT_AUTH_REQUIRED') {
      throw error;
    }
    
    // その他のエラーの場合は汎用エラーメッセージ
    throw new Error('Authentication failed. Please try again.');
  }
}

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