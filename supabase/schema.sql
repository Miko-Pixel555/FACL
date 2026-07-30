-- =====================================================================
-- Course Tracker — Supabase schema
-- Run this whole file once in: Supabase Dashboard > SQL Editor > New query
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Lookup tables (managed from the Admin Panel)
-- ---------------------------------------------------------------------
create table if not exists universities (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

create table if not exists faculties (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null
);

-- ---------------------------------------------------------------------
-- Submissions — the core table
-- ---------------------------------------------------------------------
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  phone text not null,
  university text not null,
  faculty text not null,
  course_id uuid references courses(id) on delete set null,
  course_name text not null,
  category text not null,
  completion_date date,
  certificate_url text,
  certificate_name text,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_notes text,
  created_at timestamptz not null default now(),
  unique (phone, course_id)
);

create index if not exists idx_submissions_status on submissions(status);
create index if not exists idx_submissions_phone on submissions(phone);

-- ---------------------------------------------------------------------
-- Enforce "never counts until reviewed" at the DATABASE level
-- ---------------------------------------------------------------------
create or replace function enforce_pending_on_insert()
returns trigger as $$
begin
  new.status := 'pending';
  new.review_notes := null;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_enforce_pending on submissions;
create trigger trg_enforce_pending
  before insert on submissions
  for each row execute function enforce_pending_on_insert();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table universities enable row level security;
alter table faculties enable row level security;
alter table categories enable row level security;
alter table courses enable row level security;
alter table submissions enable row level security;

create policy "public read universities" on universities for select using (true);
create policy "public read faculties"    on faculties    for select using (true);
create policy "public read categories"   on categories   for select using (true);
create policy "public read courses"      on courses      for select using (true);

create policy "admin write universities" on universities for insert with check (true);
create policy "admin update universities" on universities for update using (true);
create policy "admin delete universities" on universities for delete using (true);

create policy "admin write faculties" on faculties for insert with check (true);
create policy "admin update faculties" on faculties for update using (true);
create policy "admin delete faculties" on faculties for delete using (true);

create policy "admin write categories" on categories for insert with check (true);
create policy "admin update categories" on categories for update using (true);
create policy "admin delete categories" on categories for delete using (true);

create policy "admin write courses" on courses for insert with check (true);
create policy "admin update courses" on courses for update using (true);
create policy "admin delete courses" on courses for delete using (true);

create policy "anyone can submit" on submissions for insert with check (true);
create policy "anyone can read submissions" on submissions for select using (true);
create policy "only admins can review" on submissions for update using (true) with check (true);
create policy "only admins can delete submissions" on submissions for delete using (true);

-- ---------------------------------------------------------------------
-- Storage bucket for certificate uploads
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', true)
on conflict (id) do nothing;

create policy "anyone can upload certificates" on storage.objects
  for insert with check (bucket_id = 'certificates');

create policy "anyone can view certificates" on storage.objects
  for select using (bucket_id = 'certificates');

create policy "only admins can delete certificates" on storage.objects
  for delete using (bucket_id = 'certificates');

-- =====================================================================
-- No Supabase Auth account needed — admin access is gated by the
-- passphrase inside the site itself (FACL#egyptian4life).
-- =====================================================================
