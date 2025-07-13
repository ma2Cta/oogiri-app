# 🚀 Oogiri App - Render.com デプロイガイド

## なぜ Render.com？

```
✅ WebSocket完全対応（長時間接続安定）
✅ PostgreSQL $7/月
✅ Web Service 無料
✅ GitHub自動デプロイ
✅ リアルタイムゲームに最適
```

## 📋 デプロイ手順

### 1. **Render.com アカウント作成**
[Render.com](https://render.com/) でアカウント作成

### 2. **PostgreSQL作成**
1. Dashboard → New → PostgreSQL
2. Name: `oogiri-database`
3. Plan: `Starter ($7/month)`
4. 作成後、Connection Stringをコピー

### 3. **Web Service作成**
1. Dashboard → New → Web Service
2. GitHub リポジトリ接続
3. 以下を設定:

```yaml
Name: oogiri-app
Environment: Node
Build Command: npm ci && npm run build
Start Command: npm start
```

### 4. **環境変数設定**

Environment Variables で以下を追加:

```bash
DATABASE_URL=postgresql://...  # PostgreSQLのConnection String
NEXTAUTH_URL=https://oogiri-app.onrender.com
NEXTAUTH_SECRET=your-random-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NODE_ENV=production
```

### 5. **Google OAuth設定**

[Google Cloud Console](https://console.cloud.google.com/):
1. OAuth 2.0 クライアント ID 作成
2. 承認済みリダイレクト URI:
   ```
   https://oogiri-app.onrender.com/api/auth/callback/google
   ```

### 6. **初回デプロイ後の設定**

```bash
# Render Shell で実行
npm run db:push
curl -X POST https://oogiri-app.onrender.com/api/seed
```

## 💰 **コスト**
- **Web Service**: 無料
- **PostgreSQL**: $7/月
- **合計**: $7/月

## 🔧 **カスタム設定**

### render.yaml (推奨)
```yaml
services:
  - type: web
    name: oogiri-app
    env: node
    buildCommand: npm ci && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

## ✅ **動作確認**
1. `https://your-app.onrender.com` にアクセス
2. Googleでログイン  
3. ルーム作成・参加テスト
4. WebSocket接続確認

## 🆘 **トラブルシューティング**

### WebSocket接続エラー
```javascript
// 正しいWebSocket URL確認
console.log('WebSocket URL:', wsUrl);
```

### データベース接続エラー
```bash
# Render Shell で確認
echo $DATABASE_URL
npm run db:push
```

### ログ確認
Render Dashboard → Logs でリアルタイムログ確認

## 🎯 **本番運用**

### 自動デプロイ
- GitHub プッシュで自動デプロイ
- ビルドログをリアルタイム確認

### モニタリング
- Render Dashboard でメトリクス確認
- WebSocket接続数監視
- データベースパフォーマンス確認

### スケーリング
- 必要に応じて有料プランにアップグレード
- 複数インスタンスでロードバランシング

**🎉 Render.com なら WebSocket が安定動作します！**