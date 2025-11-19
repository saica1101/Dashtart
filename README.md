# Dashtart

Dashboard-style personal start page built with Next.js 16, React 19, Tailwind CSS 4, and Radix UI primitives.

## 開発環境
1. 依存関係をインストール
   ```bash
   npm install
   ```
2. 開発サーバーを起動
   ```bash
   npm run dev
   ```
3. Lint / ビルド
   ```bash
   npm run lint
   npm run build
   ```

## GitHub Pages へのデプロイ
このリポジトリには GitHub Pages 用のワークフロー（`.github/workflows/deploy.yml`）を追加しています。`main` ブランチへ push すると以下が自動で行われます。

1. `npm install` で依存関係を取得
2. `npm run build` で `out/` ディレクトリに静的サイトを生成（`next.config.mjs` にて `output: 'export'` を使用）
3. 生成物を GitHub Pages へアップロード

### ベースパスについて
- GitHub Pages のユーザー/オーガニゼーションサイト（`<user>.github.io`）の場合は自動でベースパス無しになります。
- プロジェクトサイトの場合はリポジトリ名が自動的に `NEXT_PUBLIC_GITHUB_PAGES_BASE_PATH` として注入され、`next.config.mjs` の `basePath`/`assetPrefix` が `/your-repo-name` に設定されます。
- ローカル開発時にベースパスを上書きしたい場合は `.env.local` に `NEXT_PUBLIC_GITHUB_PAGES_BASE_PATH=` を設定してください。

### 必要な GitHub 側の設定
1. Pages のソースを「GitHub Actions」に変更
2. デフォルトブランチを `main` にしておくこと
3. ワークフローが初回に完走すると公開 URL が `https://<user>.github.io/<repo>` で利用できます

## 既知の注意点
- Server Actions や動的ルートハンドラーは静的エクスポートでは使用できません。天気データ取得はクライアントサイドの fetch に置き換え済みです。
- 外部 API（Open-Meteo）への通信が必要なので、ブラウザの CORS/ネットワーク設定が必要です。
