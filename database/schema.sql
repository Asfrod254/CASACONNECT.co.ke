-- CasaConnect database schema for Supabase/PostgreSQL.
-- Run this file in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  phone text not null default '',
  preferred_area text not null default '',
  company text not null default '',
  role text not null default 'tenant' check (role in ('tenant', 'landlord', 'admin')),
  account_status text not null default 'active' check (account_status in ('active', 'pending', 'suspended')),
  created_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  address text not null,
  city text not null,
  description text not null default '',
  rent numeric(12, 2) not null check (rent > 0),
  bedrooms integer not null default 0 check (bedrooms >= 0),
  bathrooms integer not null default 0 check (bathrooms >= 0),
  amenities jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  listing_status text not null default 'pending' check (listing_status in ('pending', 'approved', 'rejected', 'suspended')),
  available_from timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  tenant_id uuid not null references public.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null default '',
  moderation_status text not null default 'approved' check (moderation_status in ('pending', 'approved', 'flagged', 'removed')),
  created_at timestamptz not null default now(),
  unique (property_id, tenant_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  message text not null check (length(trim(message)) > 0),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.rental_requests (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  tenant_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'withdrawn')),
  message text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, tenant_id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  tenant_id uuid not null references public.users(id) on delete restrict,
  landlord_id uuid references public.users(id) on delete set null,
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'KES',
  method text not null check (method in ('mpesa', 'stripe', 'bank_transfer', 'other')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  provider_reference text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- Repair tables created by an earlier version of the schema.
alter table public.users drop constraint if exists users_role_check;
alter table public.users add constraint users_role_check check (role in ('tenant', 'landlord', 'admin'));
alter table public.users add column if not exists full_name text not null default '';
alter table public.users add column if not exists phone text not null default '';
alter table public.users add column if not exists preferred_area text not null default '';
alter table public.users add column if not exists company text not null default '';
alter table public.users add column if not exists account_status text not null default 'active';
alter table public.users add column if not exists created_at timestamptz not null default now();
alter table public.properties add column if not exists created_at timestamptz not null default now();
alter table public.properties add column if not exists address text not null default '';
alter table public.properties add column if not exists city text not null default '';
alter table public.properties add column if not exists rent numeric(12, 2) not null default 1 check (rent > 0);
alter table public.properties add column if not exists bedrooms integer not null default 0 check (bedrooms >= 0);
alter table public.properties add column if not exists bathrooms integer not null default 0 check (bathrooms >= 0);
alter table public.properties add column if not exists amenities jsonb not null default '[]'::jsonb;
alter table public.properties add column if not exists images jsonb not null default '[]'::jsonb;
alter table public.properties add column if not exists listing_status text not null default 'pending';
alter table public.reviews add column if not exists created_at timestamptz not null default now();
alter table public.reviews add column if not exists moderation_status text not null default 'approved';
alter table public.messages add column if not exists created_at timestamptz not null default now();
alter table public.messages add column if not exists read_at timestamptz;
alter table public.rental_requests add column if not exists updated_at timestamptz not null default now();

create index if not exists properties_landlord_id_idx on public.properties (landlord_id);
create index if not exists properties_created_at_idx on public.properties (created_at desc);
create index if not exists reviews_property_id_idx on public.reviews (property_id);
create index if not exists messages_property_id_created_at_idx on public.messages (property_id, created_at);
create index if not exists rental_requests_tenant_id_idx on public.rental_requests (tenant_id);
create index if not exists rental_requests_property_id_idx on public.rental_requests (property_id);
create index if not exists payments_tenant_id_idx on public.payments (tenant_id);
create index if not exists payments_landlord_id_idx on public.payments (landlord_id);
create index if not exists payments_created_at_idx on public.payments (created_at desc);

alter table public.users enable row level security;
alter table public.properties enable row level security;
alter table public.reviews enable row level security;
alter table public.messages enable row level security;
alter table public.rental_requests enable row level security;
alter table public.payments enable row level security;

-- Public catalogue access is required by GET /properties and property reviews.
drop policy if exists "Public can read properties" on public.properties;
create policy "Public can read properties"
  on public.properties for select using (true);

drop policy if exists "Public can read reviews" on public.reviews;
create policy "Public can read reviews"
  on public.reviews for select using (true);

-- All writes and private data access are performed by the backend service role.
-- The service role bypasses RLS; no client-side policy can create landlord accounts.

-- Realtime: broadcast new messages to participants (tenants + owning landlord).
alter publication supabase_realtime add table public.messages;

drop policy if exists "Participants can read messages" on public.messages;
create policy "Participants can read messages"
  on public.messages for select
  using (
    sender_id = auth.uid()
    or property_id in (
      select id from public.properties where landlord_id = auth.uid()
    )
  );
