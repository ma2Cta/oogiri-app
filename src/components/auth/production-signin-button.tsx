import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/app/actions/auth';

/**
 * 本番環境専用のサーバーアクション対応サインインボタン
 * Cloud Run等でのINVALID_REQUESTエラー回避のため、
 * フォームベースのサーバーアクションを使用
 */
export function ProductionSignInButton() {
  return (
    <form action={signInWithGoogle}>
      <Button 
        type="submit"
        className="w-full"
      >
        Googleでログイン
      </Button>
    </form>
  );
}