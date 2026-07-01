# JIS.bar 公式メンバーアプリ 要件定義書

**バージョン**: v0.1（プロトタイプ）  
**技術スタック**: Next.js 16 App Router / TypeScript / Tailwind CSS / Supabase  
**将来方針**: 現在は Web アプリ（Vercel 運用）、将来はネイティブアプリに移行予定

---

## 1. プロジェクト概要

相席屋チェーン JIS（8 店舗）の公式会員アプリ。来客が自身の会員ランク・注文・掲示板・チェックインを一元管理する。スタッフではなく**客側が使う**アプリ。

---

## 2. 技術スタック

| 項目 | 内容 |
|---|---|
| フロントエンド | Next.js 16 App Router, TypeScript, Tailwind CSS |
| バックエンド / DB | Supabase (PostgreSQL) |
| 認証 | Supabase Auth (`@supabase/ssr` v0.12.0) |
| ストレージ | Supabase Storage（プロフィール写真） |
| ホスティング | Vercel |
| リポジトリ | GitHub (`clover1603/jis-lounge-app`) |

---

## 3. 環境

```
NEXT_PUBLIC_SUPABASE_URL=https://cnfogjfzcylebblicaie.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=（Vercel 環境変数に設定済み）
```

- `.env.local` はリポジトリに含めない（セキュリティ上の理由）
- ローカル開発は Vercel 環境変数を参照、または手動で `.env.local` を作成

---

## 4. 画面構成

### ナビゲーション（BottomNav 5タブ）

```
マイページ ／ 掲示板 ／ チェックイン ／ 店内人数 ／ メッセージ
```

iPhone のセーフエリア対応済み（`env(safe-area-inset-bottom)` + `viewportFit: cover`）

---

### 4-1. 認証

| 画面 | パス | 内容 |
|---|---|---|
| ログイン | `/login` | メール＋パスワード、新規登録リンク |
| 新規登録 | `/register` | メール＋パスワード＋ニックネーム＋生年月日＋性別 |

- 未認証ユーザーは `(main)/layout.tsx` で `/login` にリダイレクト
- 新規登録時に `profiles` レコードを Postgres トリガーで自動生成
- `member_id` は `JIS-000001` 形式でシーケンス採番

---

### 4-2. マイページ (`/mypage`)

**プロフィールヘッダー**
- アバター（プロフィール写真 1 枚目、未設定時はニックネーム頭文字）
- ニックネーム / 年齢 / 会員ID / 認証バッジ
- マイレージポイント表示

**会員ランク**（タブ切替）
- ランク: BRONZE / SILVER / GOLD / PLATINUM / DIAMOND
- 昇格条件: 評価点（相席相手からの評価平均）と総相席時間の 2 軸
- 評価点・相席時間の進捗バーを表示
- ランク条件モーダル（? ボタン）

| ランク | 評価点 | 相席時間（男性） | 相席時間（女性） |
|---|---|---|---|
| BRONZE | - | 0h | 0h |
| SILVER | - | 2h | 2h |
| GOLD | 3.1 | 10h | 13h |
| PLATINUM | 3.3 | 25h | 45h |
| DIAMOND | 3.5 | 45h | 90h |

**称号**（タブ切替）

| カテゴリ | アイコン | 段階 |
|---|---|---|
| 来店回数 | 🏠 | 1/3/10/30/50/100回 |
| ボトルキープ | 🍾 | 1/5/10本 |
| シャンパン | 🥂 | 1/5本 |
| プロフィール | 👤 | 完成 |
| お気に入り | ⭐ | 3店舗/全8店舗 |

> **TODO**: 称号の数値は現在ハードコード。visit_logs・orders DB と連動させる必要あり

**ランキング**

| 軸 | 会計金額 / 相席時間 |
|---|---|
| 期間 | 日別 / 月別 / 累計 |
| データソース | `get_ranking` RPC（`visit_logs` テーブルを集計） |

**メニューリスト**
- プロフィール編集 → `/mypage/edit`
- 設定 → `/mypage/settings`（未実装）
- ログアウト

---

### 4-3. プロフィール編集 (`/mypage/edit`)

すべてのフィールドが選択式またはチップ選択。

| フィールド | 入力形式 |
|---|---|
| ニックネーム | テキスト |
| 自己紹介 | テキストエリア（200文字） |
| MBTI | セレクト（16種） |
| 職業 | セレクト（IT/医療/金融/教育/飲食/販売/公務員/自営業/その他） |
| 身長 | 数値 (cm) |
| 体型 | セレクト（細身/スリム/普通/がっちり/ぽっちゃり） |
| 生年月日 | date picker |
| 居住地 | セレクト（都道府県47選択肢） |
| 勤務地 | セレクト（都道府県47選択肢） |
| 休日 | セレクト（土日/平日/不定期/土曜/日曜/祝日） |
| お気に入り地域 | チップ複数選択（都道府県、カンマ区切りで DB 保存） |
| 写真 | Supabase Storage アップロード（最大6枚） |

---

### 4-4. 掲示板 (`/board`)

- 投稿一覧（新しい順）
- ニックネーム / 年齢 / 地域タグ / 本文 / いいね / 投稿時間
- いいね機能（`likes` テーブル、楽観的 UI 更新）
- 他ユーザーへのメッセージ送信（ボトムシート → `messages` テーブルに INSERT）
- 絞り込み: 自分の投稿のみ表示切替
- **写真未設定時は投稿・メッセージ送信不可**（`NoPhotoSheet` で誘導）

**新規投稿 (`/board/new`)**
- 本文 200 文字
- 地域タグ複数選択（全国主要都市）
- 写真未設定時はブロック

---

### 4-5. 注文 (`/order`)

- メニューを `menu_items` テーブルから取得
- カテゴリタブ: フード / ドリンク / ボトル / シャンパン / その他
- カートに追加 → `/order/cart` で確認 → 注文確定
- 注文確定時に `active_checkin.totalAmount` へ加算（localStorage）
- **注文の DB 保存は未実装**（将来タスク）

**カート (`/order/cart`)**
- 数量変更・削除
- 小計 + サービス料10% = 合計
- 注文確定でモーダル表示 → 掲示板へ遷移

---

### 4-6. チェックイン (`/checkin`)

**3ステップフロー（デモ版）**

```
Step 1: QRスキャン画面 + 店舗選択セレクト + デモボタン
Step 2: グループ人数入力（1〜20名、+/−ボタン）
Step 3: チェックイン完了・入店中画面
```

**入店中画面（Step 3）**
- 入店時間（HH:MM 表示）
- 滞在時間（秒単位ライブカウンター）
- グループ人数
- 現在会計グループ合計（注文確定のたびに累積加算）
- 現在会計一人当たり（合計 ÷ 人数）
- 「注文する」ボタン → `/order`
- 「退店する」ボタン → セッションクリア

**セッション管理（localStorage）**

```typescript
// キー: 'active_checkin'
type Session = {
  storeName: string
  checkedInAt: string  // ISO 8601
  groupSize: number
  totalAmount: number  // 注文確定のたびに累積加算
}
```

- アプリ起動時に `active_checkin` があれば自動的に入店中画面を表示
- **チェックインの DB 記録（visit_logs）は未実装**（将来タスク）

---

### 4-7. 店内人数 (`/stores`)

- `stores` テーブルから男性人数・女性人数・合計を表示（2カラムグリッド）
- プログレスバー（30人満席想定）
- お気に入り店舗（localStorage 保存、星アイコン）、お気に入り順にソート
- 各カードに「情報を見る →」リンク → ブラウザで `https://jisjis.com/info/ipadinfo/{id}/index.html` を開く

**店舗コード → 情報ページ ID 対応表**

| 店舗 | stores.id | 情報ページID |
|---|---|---|
| 福岡天神 | FUKUOKA | 1 |
| 札幌 | SAPPORO | 2 |
| 難波 | NAMBA | 3 |
| 熊本 | KUMAMOTO | 5 |
| 梅田 | UMEDA | 9 |
| 西新宿 | NSHINJUKU | 11 |
| 新宿 | SHINJUKU | 12 |
| 茶屋町 | CHAYA | 13 |

> ネイティブアプリ移行後は `<a target="_blank">` を WebView コンポーネントに置き換える

---

### 4-8. メッセージ (`/messages`)

- 受信 DM 一覧
- 未実装部分あり（詳細チャット画面）

---

## 5. DB スキーマ（主要テーブル）

```sql
profiles       -- ユーザープロフィール（auth.usersと1:1）
posts          -- 掲示板投稿
likes          -- いいね（posts:likesは1:N）
messages       -- DM（sender_id, receiver_id, content）
stores         -- 店舗情報（id: text型 = 店舗コード）
menu_items     -- メニュー（id, name, price, category, description）
visit_logs     -- 来店履歴（ランキング集計・member_rank算出に使用）
```

**member_rank の自動更新**
- `visit_logs` に INSERT/UPDATE するたびに Postgres トリガーが発火
- `recalc_member_rank(user_id)` 関数でランクを再計算し `profiles.member_rank` を更新

**ランキング RPC**

```sql
get_ranking(p_metric TEXT, p_period TEXT) RETURNS TABLE
  -- p_metric: 'amount' | 'hours'
  -- p_period: 'daily' | 'monthly' | 'total'
```

完全なスキーマは `supabase/migrations/001_initial.sql` を参照。

---

## 6. 未実装・将来タスク

| 優先度 | タスク | 備考 |
|---|---|---|
| 高 | チェックイン → visit_logs 記録 | 現在はローカルのみ |
| 高 | 注文 → orders テーブル保存 | 現在は画面表示のみ |
| 高 | メッセージ詳細（チャット画面） | 送信のみ実装済み |
| 中 | 称号バッジの DB 連動 | 現在ハードコード |
| 中 | 設定画面 (`/mypage/settings`) | 未実装 |
| 低 | スタッフ用店内人数更新機能 | 別途管理画面が必要 |
| 低 | VIPセグメント分類 | fee_rule_type カラム追加後に対応 |
| 低 | 絵文字マスター管理画面 | 将来タスク |

---

## 7. ネイティブアプリ移行時の注意点

- `localStorage` / `sessionStorage` → AsyncStorage 等に置き換え
- `window.open(url, '_blank')` → WebView コンポーネントに置き換え（X-Frame-Options も無効化される）
- `env(safe-area-inset-bottom)` → ネイティブの SafeAreaView に置き換え
- Supabase JS SDK はそのまま使用可能

---

## 8. 注意事項

- `.env.local` や API キーは絶対にリポジトリにコミットしない
- `import.gs` は変更しない（GAS 側のルール、本アプリとは独立したシステム）
