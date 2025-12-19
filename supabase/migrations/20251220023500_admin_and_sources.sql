-- 1. Add Banners Table
create table if not exists public.banners (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  image_url text not null,
  link_url text,
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Banners
alter table public.banners enable row level security;

drop policy if exists "Banners are viewable by everyone." on public.banners;
create policy "Banners are viewable by everyone."
  on public.banners for select
  using ( true );

drop policy if exists "Admins can manage banners." on public.banners;
create policy "Admins can manage banners."
  on public.banners for all
  using ( 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- 2. Add Announcements Table
create table if not exists public.announcements (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text,
  is_active boolean default true,
  type text default 'info', -- info, warning, alert
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Announcements
alter table public.announcements enable row level security;

drop policy if exists "Announcements are viewable by everyone." on public.announcements;
create policy "Announcements are viewable by everyone."
  on public.announcements for select
  using ( true );

drop policy if exists "Admins can manage announcements." on public.announcements;
create policy "Admins can manage announcements."
  on public.announcements for all
  using ( 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- 3. Add Source Fields to Events
alter table public.events 
add column if not exists source_url text,
add column if not exists external_id text,
add column if not exists original_data jsonb;

-- Index for external_id to prevent duplicates efficiently
create index if not exists idx_events_external_id on public.events(external_id);
