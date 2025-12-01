-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text default 'member' check (role in ('member', 'host', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- 2. Clubs Table
create table public.clubs (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  cover_image text,
  owner_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Clubs
alter table public.clubs enable row level security;

create policy "Clubs are viewable by everyone."
  on public.clubs for select
  using ( true );

create policy "Authenticated users can create clubs."
  on public.clubs for insert
  with check ( auth.role() = 'authenticated' );

create policy "Owners can update their clubs."
  on public.clubs for update
  using ( auth.uid() = owner_id );

-- 3. Club Members Table
create table public.club_members (
  id uuid default uuid_generate_v4() primary key,
  club_id uuid references public.clubs(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('member', 'admin')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(club_id, user_id)
);

-- RLS for Club Members
alter table public.club_members enable row level security;

create policy "Club members are viewable by everyone."
  on public.club_members for select
  using ( true );

create policy "Users can join clubs."
  on public.club_members for insert
  with check ( auth.uid() = user_id );

-- 4. Events Table
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  type text not null,
  date date not null,
  time time not null,
  location_name text not null,
  address text not null,
  latitude double precision,
  longitude double precision,
  image_url text,
  organizer_id uuid references public.profiles(id) not null,
  club_id uuid references public.clubs(id),
  is_public boolean default true,
  price numeric default 0,
  currency text default 'TWD',
  capacity integer,
  registered_count integer default 0,
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Events
alter table public.events enable row level security;

create policy "Public events are viewable by everyone."
  on public.events for select
  using ( true );

create policy "Authenticated users can create events."
  on public.events for insert
  with check ( auth.role() = 'authenticated' );

create policy "Organizers can update their events."
  on public.events for update
  using ( auth.uid() = organizer_id );

-- 5. Registrations Table
create table public.registrations (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'confirmed' check (status in ('pending', 'confirmed', 'cancelled', 'attended')),
  ticket_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(event_id, user_id)
);

-- RLS for Registrations
alter table public.registrations enable row level security;

create policy "Users can view their own registrations."
  on public.registrations for select
  using ( auth.uid() = user_id );

create policy "Organizers can view registrations for their events."
  on public.registrations for select
  using ( 
    exists (
      select 1 from public.events
      where events.id = registrations.event_id
      and events.organizer_id = auth.uid()
    )
  );

create policy "Users can register for events."
  on public.registrations for insert
  with check ( auth.uid() = user_id );

-- Trigger to handle new user signup (automatically create profile)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Event Roles (For Vendor Recruitment)
create table public.event_roles (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  role_type text not null, -- e.g., 'photographer', 'dj', 'staff'
  count_needed integer default 1,
  budget_min numeric,
  budget_max numeric,
  description text,
  status text default 'open' check (status in ('open', 'closed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Event Roles
alter table public.event_roles enable row level security;

create policy "Event roles are viewable by everyone."
  on public.event_roles for select
  using ( true );

create policy "Organizers can manage event roles."
  on public.event_roles for all
  using ( 
    exists (
      select 1 from public.events
      where events.id = event_roles.event_id
      and events.organizer_id = auth.uid()
    )
  );

-- 7. Event Resources (For Supplier Recruitment)
create table public.event_resources (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  resource_type text not null, -- e.g., 'venue', 'sponsor', 'equipment'
  description text,
  status text default 'open' check (status in ('open', 'closed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Event Resources
alter table public.event_resources enable row level security;

create policy "Event resources are viewable by everyone."
  on public.event_resources for select
  using ( true );

create policy "Organizers can manage event resources."
  on public.event_resources for all
  using ( 
    exists (
      select 1 from public.events
      where events.id = event_resources.event_id
      and events.organizer_id = auth.uid()
    )
  );

-- 8. Applications (Vendor/Supplier applying to Events)
create table public.applications (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  target_role_id uuid references public.event_roles(id) on delete set null,
  target_resource_id uuid references public.event_resources(id) on delete set null,
  message text,
  contact_info text, -- Simple text for MVP, can be JSON later
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, target_role_id), -- Prevent duplicate apps for same role
  unique(user_id, target_resource_id) -- Prevent duplicate apps for same resource
);

-- RLS for Applications
alter table public.applications enable row level security;

create policy "Users can view their own applications."
  on public.applications for select
  using ( auth.uid() = user_id );

create policy "Organizers can view applications for their events."
  on public.applications for select
  using ( 
    exists (
      select 1 from public.events
      where events.id = applications.event_id
      and events.organizer_id = auth.uid()
    )
  );

create policy "Users can create applications."
  on public.applications for insert
  with check ( auth.uid() = user_id );

create policy "Organizers can update application status."
  on public.applications for update
  using ( 
    exists (
      select 1 from public.events
      where events.id = applications.event_id
      and events.organizer_id = auth.uid()
    )
  );
