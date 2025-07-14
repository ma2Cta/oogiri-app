import { SignInButton } from './signin-button';
import { ProductionSignInButton } from './production-signin-button';
import { isProduction } from '@/lib/auth-utils';

/**
 * 環境に応じて適切なサインインボタンを表示
 * - 開発環境: クライアントサイド認証（next-auth/react）
 * - 本番環境: サーバーアクション認証（Cloud Run対応）
 */
export function AdaptiveSignInButton() {
  if (isProduction()) {
    return <ProductionSignInButton />;
  } else {
    return <SignInButton />;
  }
}