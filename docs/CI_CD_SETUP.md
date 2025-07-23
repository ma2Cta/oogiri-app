# CI/CD セットアップガイド

## 概要

このドキュメントでは、oogiri-appのCI/CD環境でのデプロイメントセットアップ方法を説明します。

## 必要な環境変数

CI/CD環境で`npm run deploy:setup`を実行する前に、以下の環境変数を設定する必要があります：

### データベース接続
- `DATABASE_URL`: PostgreSQLデータベースの接続URL
  - 形式: `postgresql://user:password@host:port/database`
  - 例: `postgresql://myuser:mypass@localhost:5432/oogiri_db`

### 認証設定（本番環境用）
- `NEXTAUTH_URL`: アプリケーションのベースURL（例: `https://oogiri-app.example.com`）
- `NEXTAUTH_SECRET`: NextAuth.jsのシークレットキー（ランダムな文字列）

## deploy:setup コマンドについて

`npm run deploy:setup`は以下の処理を自動実行します：

1. **データベーススキーマの適用** (`db:push:ci`)
   - `drizzle-kit push --force`を使用してスキーマを適用
   - `--force`フラグにより、インタラクティブな確認を省略

2. **本番用シードデータの投入** (`db:seed:production`)
   - 本番環境用の初期お題データを投入

## CI/CDでの実行例

### GitHub Actions
```yaml
- name: Setup Database
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  run: npm run deploy:setup
```

### GitLab CI
```yaml
deploy:
  script:
    - npm install
    - npm run deploy:setup
  variables:
    DATABASE_URL: $CI_DATABASE_URL
```

### その他のCI/CDサービス
環境変数`DATABASE_URL`を設定し、以下のコマンドを実行：
```bash
npm run deploy:setup
```

## 注意事項

1. **データ損失のリスク**
   - `db:push:ci`コマンドは`--force`フラグを使用するため、既存のデータが削除される可能性があります
   - 本番環境での初回セットアップ時のみ使用することを推奨

2. **環境変数の確認**
   - `DATABASE_URL`が正しく設定されていることを確認してください
   - 接続エラーが発生した場合は、データベースへのネットワークアクセスを確認してください

3. **シードデータ**
   - `db:seed:production`は本番環境用の限定的なデータのみを投入します
   - 開発環境用のテストデータは含まれません

## トラブルシューティング

### データベース接続エラー
```
Error: Connection refused
```
- データベースが起動していることを確認
- `DATABASE_URL`の形式が正しいことを確認
- ネットワーク/ファイアウォール設定を確認

### スキーマ適用エラー
```
Error: Schema mismatch
```
- データベースのバージョンを確認
- 必要に応じて、手動でデータベースをバックアップ後、クリーンな状態から再実行

### シードデータ投入エラー
```
Error: Duplicate key value
```
- データベースが既にシードデータを含んでいる可能性があります
- 必要に応じて、既存データを確認してください