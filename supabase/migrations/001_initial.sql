-- ============================================================
-- JIS.bar App — Initial Schema
-- Supabase SQL Editor で実行してください
-- ============================================================

-- -------------------------------------------------------
-- 1. profiles（ユーザープロフィール）
-- -------------------------------------------------------
create table if not exists public.profiles (
  id              uuid references auth.users(id) on delete cascade primary key,
  member_id       text not null unique,
  nickname        text not null,
  birthday        date,
  gender          text default 'male',
  rating          numeric default 3.0,
  seating_hours   numeric default 0,
  bio             text default '',
  mbti            text default '',
  job             text default '',
  height          int,
  body_type       text default '',
  prefecture      text default '',
  work_location   text default '',
  holiday         text default '',
  favorite_areas  text default '',
  photos          text[] default '{}',
  mileage         int default 0,
  created_at      timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "全員閲覧可" on public.profiles for select using (true);
create policy "自分のみ更新可" on public.profiles for update using (auth.uid() = id);

-- member_id 自動採番
create sequence if not exists member_id_seq start 1;

create or replace function public.set_member_id()
returns trigger as $$
begin
  new.member_id := 'JIS-' || lpad(nextval('member_id_seq')::text, 6, '0');
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_member_id_trigger on public.profiles;
create trigger set_member_id_trigger
  before insert on public.profiles
  for each row
  when (new.member_id is null or new.member_id = '')
  execute function public.set_member_id();

-- 新規ユーザー登録時にprofileを自動作成
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nickname, birthday, gender)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nickname', 'ゲスト'),
    nullif(new.raw_user_meta_data->>'birthday', '')::date,
    coalesce(new.raw_user_meta_data->>'gender', 'male')
  )
  on conflict (id) do nothing;
  return new;
exception when others then
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -------------------------------------------------------
-- 2. posts（掲示板投稿）
-- -------------------------------------------------------
create table if not exists public.posts (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references auth.users(id) on delete cascade not null,
  content             text not null,
  category            text not null default 'フリー',
  images              text[] default '{}',
  target_prefectures  text[] default '{}',
  likes_count         int default 0,
  created_at          timestamptz default now()
);

alter table public.posts enable row level security;

create policy "全員閲覧可" on public.posts for select using (true);
create policy "自分の投稿のみ作成可" on public.posts for insert with check (auth.uid() = user_id);
create policy "自分の投稿のみ削除可" on public.posts for delete using (auth.uid() = user_id);

-- -------------------------------------------------------
-- 3. likes（いいね）
-- -------------------------------------------------------
create table if not exists public.likes (
  user_id     uuid references auth.users(id) on delete cascade not null,
  post_id     uuid references public.posts(id) on delete cascade not null,
  created_at  timestamptz default now(),
  primary key (user_id, post_id)
);

alter table public.likes enable row level security;

create policy "全員閲覧可" on public.likes for select using (true);
create policy "自分のいいね作成" on public.likes for insert with check (auth.uid() = user_id);
create policy "自分のいいね削除" on public.likes for delete using (auth.uid() = user_id);

-- -------------------------------------------------------
-- 4. messages（ユーザー間DM）
-- -------------------------------------------------------
create table if not exists public.messages (
  id           uuid default gen_random_uuid() primary key,
  sender_id    uuid references auth.users(id) on delete cascade not null,
  receiver_id  uuid references auth.users(id) on delete cascade not null,
  content      text not null,
  read         boolean default false,
  created_at   timestamptz default now()
);

alter table public.messages enable row level security;

create policy "送受信者のみ閲覧" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "自分のみ送信可" on public.messages
  for insert with check (auth.uid() = sender_id);
create policy "受信者のみ既読更新" on public.messages
  for update using (auth.uid() = receiver_id);

-- -------------------------------------------------------
-- 5. stores（店舗・人数）
-- -------------------------------------------------------
create table if not exists public.stores (
  id            text primary key,
  name          text not null,
  address       text default '',
  mens_count    int default 0,
  womens_count  int default 0,
  updated_at    timestamptz default now()
);

alter table public.stores enable row level security;

create policy "全員閲覧可" on public.stores for select using (true);

insert into public.stores (id, name) values
  ('SAPPORO',  'JIS札幌'),
  ('SHINJUKU',  'JIS新宿'),
  ('NSHINJUKU', 'JIS西新宿'),
  ('CHAYA',     'JIS茶屋町'),
  ('UMEDA',     'JIS梅田'),
  ('NAMBA',     'JIS難波'),
  ('FUKUOKA',   'JIS福岡'),
  ('KUMAMOTO',  'JIS熊本')
on conflict (id) do nothing;

-- -------------------------------------------------------
-- 6. menu_items（メニュー）
-- -------------------------------------------------------
create table if not exists public.menu_items (
  id          text primary key,
  name        text not null,
  price       int not null,
  category    text not null,
  description text default ''
);
alter table public.menu_items enable row level security;
create policy "全員閲覧可" on public.menu_items for select using (true);

insert into public.menu_items (id, name, price, category, description) values
  ('f1','枝豆',380,'フード','塩茹で枝豆'),
  ('f2','フライドポテト',480,'フード','サクサクポテト'),
  ('f3','チーズプレート',680,'フード','盛り合わせ4種'),
  ('f4','カルパッチョ',780,'フード','本日の鮮魚'),
  ('d1','ハイボール',550,'ドリンク','サントリー角ハイボール'),
  ('d2','レモンサワー',550,'ドリンク','生レモン搾り'),
  ('d3','カシスオレンジ',600,'ドリンク','カシスリキュール'),
  ('d4','ジントニック',600,'ドリンク','Beefeaterジン'),
  ('b1','サントリー角',5500,'ボトル','700ml'),
  ('b2','ジャックダニエル',6500,'ボトル','700ml'),
  ('b3','アブソルート',6000,'ボトル','700ml ウォッカ'),
  ('ch1','モエ エ シャンドン',18000,'シャンパン','750ml'),
  ('ch2','ヴーヴ クリコ',22000,'シャンパン','750ml イエローラベル'),
  ('ch3','ドン ペリニヨン',55000,'シャンパン','750ml 2013年'),
  ('o1','ソフトドリンク',300,'その他','コーラ/ジュース'),
  ('o2','ミネラルウォーター',200,'その他','evian 500ml'),
  ('o3','アイスクリーム',400,'その他','バニラ/チョコ'),
  ('o4','おつまみセット',580,'その他','小腹おつまみ詰め合わせ'),
  ('o5','コーヒー',350,'その他','ホット/アイス'),
  ('o6','フルーツプレート',880,'その他','季節のフルーツ盛り合わせ')
on conflict (id) do nothing;

-- -------------------------------------------------------
-- 7. visit_logs（来店履歴・会計・相席時間）
-- -------------------------------------------------------
create table if not exists public.visit_logs (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  store_id      text references public.stores(id),
  visited_at    date not null default current_date,
  amount        int default 0,
  seating_hours numeric(5,1) default 0,
  created_at    timestamptz default now()
);
alter table public.visit_logs enable row level security;
create policy "全員閲覧可" on public.visit_logs for select using (true);
create policy "自分のみ挿入可" on public.visit_logs for insert with check (auth.uid() = user_id);

-- ランキング集計 RPC
create or replace function get_ranking(p_metric text, p_period text)
returns table (rank bigint, user_id uuid, nickname text, value numeric)
language sql security definer as $$
  select
    row_number() over (order by sum(
      case when p_metric = 'amount' then v.amount::numeric else v.seating_hours end
    ) desc),
    v.user_id,
    p.nickname,
    sum(case when p_metric = 'amount' then v.amount::numeric else v.seating_hours end)
  from public.visit_logs v
  join public.profiles p on p.id = v.user_id
  where case
    when p_period = 'daily'   then v.visited_at = current_date
    when p_period = 'monthly' then date_trunc('month', v.visited_at) = date_trunc('month', current_date)
    else true
  end
  group by v.user_id, p.nickname
  order by 4 desc
  limit 10;
$$;

-- -------------------------------------------------------
-- 8. Storage: profile-photos バケット
-- -------------------------------------------------------
-- Supabase Dashboard > Storage > New bucket
-- Name: profile-photos / Public: ON
-- 以下のポリシーをSQL Editorで実行

create policy "自分のフォルダにアップロード可" on storage.objects
  for insert with check (
    bucket_id = 'profile-photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "プロフィール写真公開閲覧" on storage.objects
  for select using (bucket_id = 'profile-photos');

create policy "自分の写真のみ削除可" on storage.objects
  for delete using (
    bucket_id = 'profile-photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
