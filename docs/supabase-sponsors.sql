-- Sponsorship enquiries for the #74 race programme.
--
-- Kept apart from tow_requests on purpose. A sponsorship is a conversation
-- measured in weeks with a business, not a job measured in minutes with a
-- stranded driver, and folding the two into one table would put them in the
-- same list competing for the same attention.

create table if not exists public.sponsor_applications (
  id text primary key,
  created_at timestamptz not null default now(),
  status text not null default 'new',
  company text not null,
  contact_name text,
  email text,
  phone text,
  website text,
  level text,
  message text,
  owner_note text
);

alter table public.sponsor_applications
  add column if not exists status text not null default 'new',
  add column if not exists company text,
  add column if not exists contact_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists website text,
  add column if not exists level text,
  add column if not exists message text,
  add column if not exists owner_note text;

create index if not exists sponsor_applications_created_idx
  on public.sponsor_applications(created_at desc);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'sponsor_applications_status_check') then
    alter table public.sponsor_applications
      add constraint sponsor_applications_status_check
      check (status in ('new', 'contacted', 'accepted', 'declined'));
  end if;
end $$;

-- Same seal as the tow requests: business contact details in, nothing readable
-- by the anon key that ships to every browser. Server-side service role only.
alter table public.sponsor_applications enable row level security;
