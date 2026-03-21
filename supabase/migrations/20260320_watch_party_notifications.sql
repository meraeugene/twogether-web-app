create extension if not exists pgcrypto;

create table if not exists public.watch_party_rooms (
  id uuid primary key default gen_random_uuid(),
  host_user_id uuid not null references public.users(id) on delete cascade,
  guest_user_id uuid references public.users(id) on delete set null,
  movie_tmdb_id bigint not null,
  movie_title text not null,
  movie_slug text not null,
  movie_type text not null check (movie_type in ('movie', 'tv')),
  stream_url text not null,
  poster_url text,
  status text not null default 'pending' check (status in ('pending', 'active', 'ended', 'rejected')),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  ended_at timestamptz,
  last_activity_at timestamptz not null default now()
);

alter table public.watch_party_rooms
  add column if not exists poster_url text;

create table if not exists public.watch_party_invites (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.watch_party_rooms(id) on delete cascade,
  inviter_id uuid not null references public.users(id) on delete cascade,
  invitee_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create table if not exists public.watch_party_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.watch_party_rooms(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  content text not null check (length(trim(content)) > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.watch_party_presence (
  room_id uuid not null references public.watch_party_rooms(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  is_online boolean not null default true,
  last_seen timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references public.users(id) on delete cascade,
  actor_user_id uuid references public.users(id) on delete set null,
  type text not null check (
    type in (
      'watch_party_invite',
      'watch_party_invite_accepted',
      'watch_party_invite_rejected'
    )
  ),
  title text not null,
  body text,
  link text,
  metadata jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_watch_party_rooms_status_activity
  on public.watch_party_rooms(status, last_activity_at desc);

create index if not exists idx_watch_party_invites_invitee_status
  on public.watch_party_invites(invitee_id, status, created_at desc);

create index if not exists idx_watch_party_messages_room_created
  on public.watch_party_messages(room_id, created_at asc);

create index if not exists idx_watch_party_presence_online_seen
  on public.watch_party_presence(is_online, last_seen desc);

create index if not exists idx_notifications_recipient_read_created
  on public.notifications(recipient_user_id, is_read, created_at desc);
