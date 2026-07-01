-- Vanilla Escape Madagascar - Supabase schema
-- Run in Supabase SQL editor

create extension if not exists "pgcrypto";

-- =========== Enums
do $$ begin
  create type region_enum as enum ('north','south','east','west','center');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('pending','confirmed','cancelled','completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_role as enum ('admin','staff','client');
exception when duplicate_object then null; end $$;

-- =========== Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  country text,
  language text default 'fr',
  created_at timestamptz default now()
);

-- =========== Roles (separate table – never on profiles)
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique(user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id=_user_id and role=_role)
$$;

-- =========== Tours
create table if not exists public.tours (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_fr text not null,
  title_en text not null,
  description_fr text,
  description_en text,
  region region_enum not null,
  duration_days int not null default 1,
  price_eur numeric(10,2) not null,
  program jsonb default '[]'::jsonb,   -- [{day:1, title, description}]
  images text[] default '{}',
  video_url text,
  activity_type text,
  max_participants int default 20,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists tours_region_idx on public.tours(region);

-- =========== Tour availability
create table if not exists public.tour_availability (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid references public.tours(id) on delete cascade,
  date date not null,
  seats_left int not null,
  unique(tour_id, date)
);

-- =========== Accommodations
create table if not exists public.accommodations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region region_enum,
  description_fr text, description_en text,
  price_per_night numeric(10,2),
  images text[] default '{}',
  external_booking_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =========== Bookings
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  tour_id uuid references public.tours(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  participants int not null default 1,
  start_date date not null,
  total_price numeric(10,2),
  status booking_status default 'pending',
  notes text,
  created_at timestamptz default now()
);

-- =========== Quote requests
create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  participants int,
  desired_date date,
  trip_type text,
  options jsonb default '{}'::jsonb,
  message text,
  status text default 'new',
  created_at timestamptz default now()
);

-- =========== Contact messages
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text, email text, subject text, message text,
  created_at timestamptz default now()
);

-- =========== Blog posts
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_fr text, title_en text,
  content_fr text, content_en text,
  cover_image text,
  published boolean default false,
  created_at timestamptz default now()
);

-- =========== Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid references public.tours(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  rating int check(rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- =========== Promo codes
create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_percent int,
  discount_amount numeric(10,2),
  valid_until date,
  active boolean default true
);

-- ========== GRANTS
grant select on public.tours, public.accommodations, public.blog_posts, public.reviews, public.tour_availability to anon;
grant select, insert, update, delete on public.tours, public.accommodations, public.blog_posts, public.reviews, public.bookings, public.quote_requests, public.contact_messages, public.profiles, public.tour_availability, public.promo_codes to authenticated;
grant select on public.user_roles to authenticated;
grant insert on public.quote_requests, public.contact_messages, public.bookings to anon;
grant all on all tables in schema public to service_role;

-- ========== RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.tours enable row level security;
alter table public.tour_availability enable row level security;
alter table public.accommodations enable row level security;
alter table public.bookings enable row level security;
alter table public.quote_requests enable row level security;
alter table public.contact_messages enable row level security;
alter table public.blog_posts enable row level security;
alter table public.reviews enable row level security;
alter table public.promo_codes enable row level security;

-- Public reads
create policy "tours public read" on public.tours for select using (is_active);
create policy "accommodations public read" on public.accommodations for select using (is_active);
create policy "availability public read" on public.tour_availability for select using (true);
create policy "blog public read" on public.blog_posts for select using (published);
create policy "reviews public read" on public.reviews for select using (true);

-- Profiles
create policy "profiles self read" on public.profiles for select using (auth.uid() = id);
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = id);

-- Bookings
create policy "bookings owner read" on public.bookings for select using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "bookings insert" on public.bookings for insert with check (true);
create policy "bookings owner update" on public.bookings for update using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));

-- Quote & contact - public insert, admin read
create policy "quotes insert" on public.quote_requests for insert with check (true);
create policy "quotes admin read" on public.quote_requests for select using (public.has_role(auth.uid(),'admin'));
create policy "contact insert" on public.contact_messages for insert with check (true);
create policy "contact admin read" on public.contact_messages for select using (public.has_role(auth.uid(),'admin'));

-- Admin writes
create policy "tours admin write" on public.tours for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "accommodations admin write" on public.accommodations for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "blog admin write" on public.blog_posts for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Reviews: authenticated insert own
create policy "reviews insert" on public.reviews for insert with check (auth.uid() = user_id);

-- Trigger: auto-create profile
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name) values (new.id, new.raw_user_meta_data->>'full_name');
  insert into public.user_roles(user_id, role) values (new.id, 'client');
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();
