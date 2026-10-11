-- Retire the removed feature and its stored data. Keep unrelated notifications.
BEGIN;

DO $$
BEGIN
  IF to_regclass('public.notifications') IS NOT NULL THEN
    DELETE FROM public.notifications
    WHERE type::text IN (
      'watch_party_invite',
      'watch_party_invite_accepted',
      'watch_party_invite_rejected'
    ) OR link LIKE '/watch-party%';
  END IF;
END;
$$;

-- Dropping these tables also removes their indexes, policies, triggers and
-- realtime publication membership. Avoid CASCADE to protect unrelated objects.
DROP TABLE IF EXISTS public.watch_party_messages;
DROP TABLE IF EXISTS public.watch_party_presence;
DROP TABLE IF EXISTS public.watch_party_invites;
DROP TABLE IF EXISTS public.watch_party_rooms;

COMMIT;
