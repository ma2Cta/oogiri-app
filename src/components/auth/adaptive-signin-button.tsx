import { SignInButton } from './signin-button';
import { ProductionSignInButton } from './production-signin-button';

// 環境に応じて適切なサインインボタンを表示
export function AdaptiveSignInButton() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    return <ProductionSignInButton />;
  } else {
    return <SignInButton />;
  }
}