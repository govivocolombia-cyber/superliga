-- This mirrors the setup already run in Supabase.
-- Keep it for deployment history and future projects.

create extension if not exists "pgcrypto";

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  venue text not null,
  starts_at timestamptz not null,
  currency text not null default 'COP',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  description text,
  price_cents integer not null default 0,
  capacity integer not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete restrict,
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text,
  buyer_document text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  payment_provider text not null default 'wompi',
  provider_reference text,
  total_cents integer not null default 0,
  currency text not null default 'COP',
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null,
  total_cents integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types(id) on delete restrict,
  attendee_name text,
  attendee_email text,
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  status text not null default 'valid' check (status in ('valid', 'cancelled', 'refunded')),
  checked_in_at timestamptz,
  checked_in_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete restrict,
  result text not null check (result in ('accepted', 'duplicate', 'invalid', 'cancelled', 'unpaid')),
  staff_user_id uuid,
  device_label text,
  created_at timestamptz not null default now()
);
