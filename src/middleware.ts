import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // 開発環境では認証をスキップ
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  // Basic認証が有効な場合のみチェック
  if (process.env.BASIC_AUTH_ENABLED !== 'true') {
    return NextResponse.next()
  }

  // 認証情報の取得
  const basicAuth = request.headers.get('authorization')
  const url = request.nextUrl

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    if (user === process.env.BASIC_AUTH_USER && pwd === process.env.BASIC_AUTH_PASSWORD) {
      return NextResponse.next()
    }
  }

  // 認証失敗時
  url.pathname = '/api/auth/401'
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}