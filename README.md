# JIS.bar App

相席屋チェーン「JIS」の公式会員アプリ。掲示板・メッセージ・店内人数・チェックイン・マイページ機能を提供する。

## 技術スタック

| 領域 | 技術 |
|---|---|
| フロントエンド | Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS |
| バックエンド / DB | Supabase (PostgreSQL + Auth + Storage + RLS) |
| デプロイ | Vercel |

## ローカル開発

### 前提条件

- Node.js 18+
- Supabase プロジェクト（[supabase.com](https://supabase.com)）

### セットアップ

```bash
git clone https://github.com/clover1603/jis-lounge-app.git
cd jis-lounge-app
npm install
cp .env.local.example .env.local
# .env.local に Supabase の URL と anon key を記入
```

### 環境変数

`.env.local` に以下を設定してください：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### DB マイグレーション

Supabase Dashboard の SQL Editor で `supabase/migrations/001_initial.sql` を実行してください。

### 起動

```bash
npm run dev
# http://localhost:3000
```

## Supabase 初期設定

1. Authentication → Sign In/Providers → Email → **Confirm sign up: OFF**
2. Storage → **New bucket** → 名前: `profile-photos` → Public: **ON**
3. SQL Editor で `supabase/migrations/001_initial.sql` を実行

## 機能一覧

| タブ | 状態 | 説明 |
|---|---|---|
| 掲示板 | ✅ Supabase接続済 | 投稿・いいね・メッセージ送信 |
| メッセージ | ✅ Supabase接続済 | ユーザー間DM |
| 店内人数 | ✅ Supabase接続済 | 8店舗の男女人数表示 |
| チェックイン | ✅ Supabase接続済 | QRデモ→注文画面 |
| マイページ | ✅ Supabase接続済 | ランク・プロフィール・写真アップロード |

## 残タスク（mock-data 依存）

| ページ | 内容 |
|---|---|
| `/mypage` | `mockRankingUsers` → ランキングDBテーブル作成予定 |
| `/order` | `mockMenuItems` → メニューDBテーブル作成予定 |

## 認証・セキュリティ

- 未ログインユーザーは `/login` にリダイレクト（`(main)` レイアウトで制御）
- 全テーブルに RLS 有効
- 投稿・いいね・メッセージは `auth.uid()` を必須とするポリシーで保護
- プロフィール写真未登録ユーザーは投稿・メッセージ送信不可

## デプロイ（Vercel）

```bash
npx vercel --prod
```

Vercel ダッシュボードで環境変数（`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`）を設定すること。
