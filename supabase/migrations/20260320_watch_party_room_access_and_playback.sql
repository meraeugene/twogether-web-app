alter table public.watch_party_rooms
  add column if not exists access_type text not null default 'public'
    check (access_type in ('public', 'private'));

alter table public.watch_party_rooms
  add column if not exists playback_started_at timestamptz;

alter table public.watch_party_rooms
  add column if not exists playback_seconds integer not null default 0
    check (playback_seconds >= 0);

alter table public.watch_party_rooms
  add column if not exists playback_updated_at timestamptz;

create index if not exists idx_watch_party_rooms_access_status_activity
  on public.watch_party_rooms(access_type, status, last_activity_at desc);
