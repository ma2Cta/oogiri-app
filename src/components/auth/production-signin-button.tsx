import { Button } from '@/components/ui/button';

/**
 * 本番環境専用のサインインボタン
 * Cloud Run等でのINVALID_REQUESTエラー回避のため、
 * フォームアクションを直接NextAuth APIエンドポイントにPOST
 */
export function ProductionSignInButton() {
  return (
    <form action="/api/auth/signin/google" method="POST">
      <input type="hidden" name="callbackUrl" value="/" />
      <Button 
        type="submit"
        className="w-full"
      >
        Googleでログイン
      </Button>
    </form>
  );
}