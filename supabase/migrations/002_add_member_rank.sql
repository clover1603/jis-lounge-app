-- ============================================================
-- 002: profiles に member_rank カラムを追加
-- 本番DBへの適用は人間が実施すること
-- ============================================================

alter table public.profiles
  add column if not exists member_rank text not null default 'BRONZE';

-- 既存ユーザーのランクを再計算（visit_logsが存在するユーザーのみ）
select update_all_member_ranks();
