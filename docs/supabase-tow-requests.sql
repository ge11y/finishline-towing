-- Tow requests — the scheduled-job intake behind "Request a tow".
--
-- Field names follow the build spec's data model exactly. Every column past
-- the first five is nullable: a stranded customer who abandons the form after
-- the phone number still leaves Josh something to call back, and a partial
-- lead beats a dropped one.

create table if not exists public.tow_requests (
  id text primary key,
  created_at timestamptz not null default now(),
  status text not null default 'new',
  name text not null,
  phone text not null,
  email text,
  service_type text,
  pickup text,
  dropoff text,
  vehicle_year text,
  vehicle_make text,
  vehicle_model text,
  runs boolean,
  vehicle_flags jsonb not null default '[]'::jsonb,
  when_needed text,
  notes text,
  admin_note text,
  notified_at timestamptz
);

alter table public.tow_requests
  add column if not exists status text not null default 'new',
  add column if not exists name text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists service_type text,
  add column if not exists pickup text,
  add column if not exists dropoff text,
  add column if not exists vehicle_year text,
  add column if not exists vehicle_make text,
  add column if not exists vehicle_model text,
  add column if not exists runs boolean,
  add column if not exists vehicle_flags jsonb not null default '[]'::jsonb,
  add column if not exists when_needed text,
  add column if not exists notes text,
  add column if not exists admin_note text,
  add column if not exists notified_at timestamptz,
  -- When the job is actually booked for. Null until he schedules it, which is
  -- what separates "someone asked" from "this is on the calendar".
  add column if not exists scheduled_for timestamptz,
  -- What he will find when he gets there: on its roof, in a ditch, won't roll,
  -- wheel off. His own intake list, and the thing that decides what he brings.
  add column if not exists situation jsonb not null default '[]'::jsonb,
  -- Where the job came from. About 90% of his work arrives through AAA, so
  -- without this the list looks like the website is carrying the business when
  -- it is not — and he cannot see what the site is actually worth to him.
  add column if not exists source text not null default 'web',
  -- Which texts he has already sent the customer, and when. He sends them from
  -- his own phone, so this is a record of what he did rather than a queue of
  -- what the system will do — it stops him telling the same person twice that
  -- he is on his way.
  add column if not exists messages jsonb not null default '[]'::jsonb;

-- The list screen is "newest first, New tab first". Both are indexed because
-- Josh opens this on a phone on the shoulder of Route 302.
create index if not exists tow_requests_created_at_idx on public.tow_requests(created_at desc);
create index if not exists tow_requests_status_idx on public.tow_requests(status);
create index if not exists tow_requests_source_idx on public.tow_requests(source);
-- The schedule screen reads by date, and only ever for booked work.
create index if not exists tow_requests_scheduled_idx
  on public.tow_requests(scheduled_for)
  where scheduled_for is not null;

-- Guarded, because `add constraint` is the one statement here with no
-- `if not exists` form and this file is meant to be re-run after every edit.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'tow_requests_status_check'
  ) then
    alter table public.tow_requests
      add constraint tow_requests_status_check
      check (status in ('new', 'called', 'booked', 'done', 'spam'));
  end if;
end $$;

-- Customer names, phone numbers and pickup addresses live in this table, so it
-- is sealed: RLS on with NO policies means the anon key — which ships to every
-- browser in NEXT_PUBLIC_SUPABASE_ANON_KEY — can read and write nothing at all.
-- Every legitimate access goes through the server with the service role key,
-- which bypasses RLS: the public form route inserts, and the admin routes read
-- and update behind a session check. This is the spec's rule 3.6 enforced by
-- the database rather than by remembering to check.
alter table public.tow_requests enable row level security;
