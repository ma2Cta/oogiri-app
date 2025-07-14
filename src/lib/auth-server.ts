import NextAuth from 'next-auth';
import { authOptions } from './auth';

// NextAuth v4 ハンドラーを作成
const handler = NextAuth(authOptions);

// NextAuth API ルート用のハンドラーをエクスポート
export { handler as GET, handler as POST };

/**
 * NextAuth v4対応のサーバーサイド認証設定
 * 本番環境でのINVALID_REQUESTエラー回避のため、
 * APIルートでの直接ハンドリングを実装
 */
export const authHandler = handler;