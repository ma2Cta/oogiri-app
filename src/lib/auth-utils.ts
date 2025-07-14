/**
 * 認証関連のユーティリティ関数
 */

/**
 * 現在の環境が本番環境かどうかを判定
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

/**
 * 認証プロバイダーのリダイレクトURLを生成
 */
export const getAuthRedirectUrl = (provider: string, callbackUrl = '/'): string => {
  return `/api/auth/signin/${provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
};

/**
 * サインアウト用のリダイレクトURLを生成
 */
export const getSignOutUrl = (callbackUrl = '/'): string => {
  return `/api/auth/signout?callbackUrl=${encodeURIComponent(callbackUrl)}`;
};

/**
 * 認証エラーのログ出力
 */
export const logAuthError = (context: string, error: unknown): void => {
  console.error(`[Auth Error] ${context}:`, error);
};

/**
 * 開発環境での認証警告ログ
 */
export const logDevAuthWarning = (message: string): void => {
  if (!isProduction()) {
    console.warn(`[Auth Development] ${message}`);
  }
};