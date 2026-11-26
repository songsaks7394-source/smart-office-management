-- ============================================================================
-- Seed reference data: meeting rooms
-- ============================================================================

insert into public.meeting_rooms (room_name, capacity, location) values
  ('Room A', 6, '2nd Floor, East Wing'),
  ('Room B', 10, '2nd Floor, West Wing'),
  ('Room C', 20, '3rd Floor, Conference Center')
on conflict (room_name) do nothing;
