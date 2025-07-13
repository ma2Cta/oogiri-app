# 🚀 Oogiri App デプロイガイド

## 推奨デプロイ環境: Railway

### 💰 コスト目安
- **Railway**: 月額 $5-10（小規模利用）
- **PostgreSQL**: 含まれる
- **WebSocket**: 完全対応

## 🛠️ デプロイ手順

### 1. Google OAuth設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
2. OAuth 2.0 認証情報を作成:
   ```
   承認済みのリダイレクト URI:
   https://your-app.railway.app/api/auth/callback/google
   ```
3. `GOOGLE_CLIENT_ID` と `GOOGLE_CLIENT_SECRET` を取得

### 2. Railway デプロイ

1. [Railway](https://railway.app/) アカウント作成
2. GitHub リポジトリを接続
3. PostgreSQL データベースを追加
4. 環境変数を設定:

```bash
# 必須環境変数
DATABASE_URL=          # Railway が自動設定
NEXTAUTH_URL=          # https://your-app.railway.app
NEXTAUTH_SECRET=       # ランダムな文字列
GOOGLE_CLIENT_ID=      # Google Console から
GOOGLE_CLIENT_SECRET=  # Google Console から
```

### 3. データベース初期化

```bash
# Railway CLI をインストール
npm install -g @railway/cli

# ログイン
railway login

# プロジェクトに接続
railway link

# データベーススキーマをプッシュ
railway run npm run db:push

# お題データをシード
railway run npm run seed:prod
```

### 4. WebSocket設定

Railway では追加設定なしでWebSocketが動作します。

## 🔧 代替デプロイ環境

### Render.com

1. **Web Service** (無料)
2. **PostgreSQL** ($7/月)
3. WebSocket対応

### Fly.io

1. **アプリ** ($5-10/月)
2. **PostgreSQL** ($1-5/月)
3. Docker ベース

## 📋 デプロイ前チェックリスト

- [ ] Google OAuth 認証情報取得
- [ ] 環境変数設定
- [ ] データベース接続確認
- [ ] WebSocket動作確認
- [ ] お題データシード

## 🐛 トラブルシューティング

### WebSocket接続エラー
```javascript
// src/lib/websocket-client.ts で URL を環境に応じて変更
const wsUrl = process.env.NODE_ENV === 'production' 
  ? 'wss://your-app.railway.app' 
  : 'ws://localhost:3001';
```

### データベース接続エラー
```bash
# Railway でログを確認
railway logs

# データベース状態確認
railway run npm run db:push
```

### Google OAuth エラー
- リダイレクトURIが正しく設定されているか確認
- 本番ドメインがGoogle Consoleに登録されているか確認

## 💡 コスト最適化

1. **Railway**: 使用量ベース課金なので、小規模なら月$5程度
2. **データベース**: PostgreSQL込みで追加料金なし
3. **WebSocket**: 標準対応で追加料金なし

## 📈 スケーリング

- Railway は自動スケーリング対応
- トラフィック増加時は自動でインスタンス増加
- PostgreSQL も自動でリソース調整

## 🔒 セキュリティ

- HTTPS/WSS 自動対応
- 環境変数による秘密情報管理
- OAuth2 によるセキュアな認証

## 🎯 本番運用

```bash
# ログ監視
railway logs --follow

# パフォーマンス監視
railway metrics

# データベースバックアップ（自動）
# Railway が自動でバックアップ作成
```