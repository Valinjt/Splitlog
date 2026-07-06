-- Run this once in Supabase: Dashboard -> SQL Editor -> New Query -> paste all -> Run

create table workout_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  workout_type text,
  notes text
);

create table measurements (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  weight numeric,
  chest numeric,
  waist numeric,
  biceps numeric,
  thighs numeric,
  calves numeric,
  vertical_jump numeric,
  mile_time text
);

create table track_times (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  event text,
  time_seconds numeric,
  notes text
);

-- Enable RLS + allow public read/write (single-user app, no login flow tonight)
alter table workout_logs enable row level security;
alter table measurements enable row level security;
alter table track_times enable row level security;

create policy "public access" on workout_logs for all using (true) with check (true);
create policy "public access" on measurements for all using (true) with check (true);
create policy "public access" on track_times for all using (true) with check (true);
