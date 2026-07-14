-- ============================================================
-- Samurai Screen Recorder — Supabase schema
-- Run this in the Supabase SQL editor for your project.
-- ============================================================

-- Recordings table: one row per saved recording
create table if not exists public.recordings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  video_name text not null,
  duration_seconds integer not null default 0,
  file_size_bytes bigint not null default 0,
  storage_path text not null,
  mime_type text not null default 'video/webm',
  capture_type text not null default 'screen', -- 'screen' | 'window' | 'tab'
  created_at timestamptz not null default now()
);

create index if not exists recordings_user_id_idx on public.recordings (user_id);
create index if not exists recordings_created_at_idx on public.recordings (created_at desc);

-- Row Level Security: each user only sees/manages their own recordings
alter table public.recordings enable row level security;

create policy "Users can view their own recordings"
  on public.recordings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own recordings"
  on public.recordings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own recordings"
  on public.recordings for update
  using (auth.uid() = user_id);

create policy "Users can delete their own recordings"
  on public.recordings for delete
  using (auth.uid() = user_id);

-- ============================================================
-- Storage bucket: create a private bucket named "recordings"
-- (Do this once in Supabase Dashboard > Storage, or via SQL below)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('recordings', 'recordings', false)
on conflict (id) do nothing;

-- Storage policies: users can only access files inside a folder
-- named after their own user id, e.g. recordings/{user_id}/{filename}.webm
create policy "Users can upload to their own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view their own files"
  on storage.objects for select
  using (
    bucket_id = 'recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own files"
  on storage.objects for delete
  using (
    bucket_id = 'recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- Rate limiting / quotas (server-side, cannot be bypassed from
-- the browser). Adjust the constants below to taste.
-- ============================================================

create or replace function public.enforce_recording_limits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recording_count integer;
  hourly_count integer;
  total_bytes bigint;
  max_recordings constant integer := 50;         -- max saved recordings per user
  max_per_hour constant integer := 10;            -- max saves per rolling hour
  max_storage_bytes constant bigint := 2147483648; -- 2 GB per user
begin
  select count(*) into recording_count
  from public.recordings
  where user_id = new.user_id;

  if recording_count >= max_recordings then
    raise exception 'RECORDING_LIMIT_REACHED: You have reached the maximum of % saved recordings. Delete older recordings to save new ones.', max_recordings;
  end if;

  select count(*) into hourly_count
  from public.recordings
  where user_id = new.user_id
    and created_at > now() - interval '1 hour';

  if hourly_count >= max_per_hour then
    raise exception 'HOURLY_LIMIT_REACHED: You can save up to % recordings per hour. Please wait a bit and try again.', max_per_hour;
  end if;

  select coalesce(sum(file_size_bytes), 0) into total_bytes
  from public.recordings
  where user_id = new.user_id;

  if total_bytes + coalesce(new.file_size_bytes, 0) > max_storage_bytes then
    raise exception 'STORAGE_QUOTA_EXCEEDED: Saving this recording would exceed your % GB storage quota. Delete old recordings to free up space.', (max_storage_bytes / 1073741824.0);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_recording_limits on public.recordings;
create trigger trg_enforce_recording_limits
  before insert on public.recordings
  for each row execute function public.enforce_recording_limits();
