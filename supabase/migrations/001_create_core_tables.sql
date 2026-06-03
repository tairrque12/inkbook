-- ────────────────────────────────────────────────────────────────────────────
-- 001 Core tables: consultations, bookings (slots), artist_admins
-- Run this in: Supabase SQL Editor
-- ────────────────────────────────────────────────────────────────────────────

-- ── artist_admins ─────────────────────────────────────────────────────────
-- Stores bcrypt-hashed admin passwords keyed by artist slug.
-- Seeded on first login if ADMIN_PASSWORD env var is present.
create table if not exists artist_admins (
  slug          text primary key,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

-- ── consultations ──────────────────────────────────────────────────────────
create table if not exists consultations (
  id                    uuid primary key default gen_random_uuid(),
  artist_slug           text        not null,
  customer_name         text        not null,
  customer_email        text        not null,
  customer_phone        text,
  tattoo_idea           text        not null,
  placement             text,
  budget                text,
  preferred_date        date,
  message               text,
  reference_image_urls  text[]      not null default '{}',
  status                text        not null default 'pending'
                          check (status in ('pending','approved','declined','confirmed')),
  created_at            timestamptz not null default now()
);

create index if not exists consultations_artist_slug_idx on consultations (artist_slug);
create index if not exists consultations_status_idx     on consultations (status);

-- ── bookings (appointment slots) ───────────────────────────────────────────
create table if not exists bookings (
  id          uuid primary key default gen_random_uuid(),
  artist_slug text        not null,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  slot_type   text        not null default 'full_day'
                check (slot_type in ('small','half_day','full_day','sleeve')),
  status      text        not null default 'AVAILABLE'
                check (status in ('AVAILABLE','HELD','BOOKED')),
  held_until  timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists bookings_artist_slug_status_idx on bookings (artist_slug, status);
create index if not exists bookings_starts_at_idx          on bookings (starts_at);
