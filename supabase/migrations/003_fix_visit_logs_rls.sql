-- ============================================================
-- 003: visit_logs の SELECT RLS を自分のデータのみに変更
-- 本番DBへの適用は人間が実施すること
-- get_ranking RPC は SECURITY DEFINER のため RLS をバイパスし、
-- 引き続き全ユーザーの visit_logs を集計できる（ランキング機能への影響なし）
-- ============================================================

-- 【注意】
-- PostgreSQL の CREATE POLICY に IF NOT EXISTS は存在しない。
-- このため、既知の旧ポリシー名と新ポリシー名を DROP IF EXISTS で削除してから再作成する。
-- 本番 DB に別名の緩い SELECT ポリシーが存在する場合、その DROP は行われないため
-- 適用前に以下の確認 SQL で既存ポリシーを必ず確認すること。
--
-- 確認SQL（本番 Supabase SQL Editor で実行）:
-- select
--   schemaname,
--   tablename,
--   policyname,
--   permissive,
--   roles,
--   cmd,
--   qual,
--   with_check
-- from pg_policies
-- where schemaname = 'public'
--   and tablename = 'visit_logs'
-- order by policyname;
-- ============================================================

-- 旧ポリシー（全員閲覧可）と新ポリシーが重複する場合に備えて両方削除
drop policy if exists "全員閲覧可"   on public.visit_logs;
drop policy if exists "自分のみ閲覧可" on public.visit_logs;

-- 自分の visit_logs のみ SELECT 可能にする
-- (select auth.uid()) 形式を使うことで RLS クエリプランの最適化を有効にする
create policy "自分のみ閲覧可"
  on public.visit_logs
  as permissive
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- INSERT / UPDATE / DELETE は migration 001 のポリシーのまま変更しない:
--   INSERT: "自分のみ挿入可" using check (auth.uid() = user_id)  ← 変更なし
--   UPDATE / DELETE: ポリシー未定義 = デフォルト禁止              ← 変更なし
