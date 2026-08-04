-- profiles に INSERT ポリシーを追加
-- (UPDATE側はすでに存在するため、upsert が使えるようにする)
create policy "自分のみ挿入可"
  on public.profiles for insert
  with check ((select auth.uid()) = id);
