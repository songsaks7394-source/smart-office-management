-- ===== supabase/migrations/0001_initial_schema.sql =====
-- ============================================================================
-- Smart Office Management System - Initial Schema
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================
create type user_role as enum ('admin', 'employee');
create type repair_status as enum ('Pending', 'In Progress', 'Completed');
create type equipment_status as enum ('Pending', 'Approved', 'Rejected');
create type borrow_status as enum ('Borrowed', 'Returned', 'Overdue');
create type asset_name as enum ('Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Projector');
create type room_name as enum ('Room A', 'Room B', 'Room C');
create type notification_type as enum (
  'repair_created',
  'repair_status_changed',
  'equipment_approved',
  'equipment_rejected',
  'asset_overdue',
  'booking_confirmed'
);

-- ============================================================================
-- USERS (profile table, linked 1:1 to auth.users)
-- ============================================================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role user_role not null default 'employee',
  department text,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- REPAIR / MAINTENANCE REQUESTS
-- ============================================================================
create table public.repair_requests (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  location text not null,
  image_url text,
  status repair_status not null default 'Pending',
  created_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_repair_requests_created_by on public.repair_requests(created_by);
create index idx_repair_requests_status on public.repair_requests(status);

-- ============================================================================
-- EQUIPMENT REQUESTS
-- ============================================================================
create table public.equipment_requests (
  id uuid primary key default uuid_generate_v4(),
  item_name text not null,
  quantity integer not null check (quantity > 0),
  reason text not null,
  status equipment_status not null default 'Pending',
  request_date timestamptz not null default now(),
  requested_by uuid not null references public.users(id) on delete cascade,
  reviewed_by uuid references public.users(id),
  reviewed_at timestamptz
);

create index idx_equipment_requests_requested_by on public.equipment_requests(requested_by);
create index idx_equipment_requests_status on public.equipment_requests(status);

-- ============================================================================
-- IT BORROWING RECORDS
-- ============================================================================
create table public.borrow_records (
  id uuid primary key default uuid_generate_v4(),
  asset_name asset_name not null,
  asset_tag text,
  borrow_date timestamptz not null default now(),
  return_date timestamptz,
  due_date date not null,
  status borrow_status not null default 'Borrowed',
  borrower uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index idx_borrow_records_borrower on public.borrow_records(borrower);
create index idx_borrow_records_status on public.borrow_records(status);

-- ============================================================================
-- MEETING ROOMS
-- ============================================================================
create table public.meeting_rooms (
  id uuid primary key default uuid_generate_v4(),
  room_name room_name not null unique,
  capacity integer not null default 8,
  location text
);

-- ============================================================================
-- ROOM BOOKINGS
-- ============================================================================
create table public.room_bookings (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references public.meeting_rooms(id) on delete cascade,
  room_name room_name not null,
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  purpose text,
  booked_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint valid_time_range check (end_time > start_time)
);

create index idx_room_bookings_room_date on public.room_bookings(room_id, booking_date);
create index idx_room_bookings_booked_by on public.room_bookings(booked_by);

-- Prevent overlapping bookings for the same room on the same day
create or replace function public.check_booking_conflict()
returns trigger as $$
begin
  if exists (
    select 1 from public.room_bookings
    where room_id = new.room_id
      and booking_date = new.booking_date
      and id <> coalesce(new.id, uuid_nil())
      and (new.start_time, new.end_time) overlaps (start_time, end_time)
  ) then
    raise exception 'Booking conflict: room % is already booked for this time slot', new.room_name;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_check_booking_conflict
  before insert or update on public.room_bookings
  for each row execute function public.check_booking_conflict();

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  type notification_type not null,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  related_id uuid,
  created_at timestamptz not null default now()
);

create index idx_notifications_user_id on public.notifications(user_id, is_read);

-- ============================================================================
-- updated_at trigger helper
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_repair_requests_updated_at
  before update on public.repair_requests
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Auto-create public.users row when a new auth user signs up
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, role, department)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'employee'),
    new.raw_user_meta_data->>'department'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Auto-detect overdue borrow records (run via pg_cron or scheduled Edge Function)
-- ============================================================================
create or replace function public.mark_overdue_assets()
returns void as $$
begin
  update public.borrow_records
  set status = 'Overdue'
  where status = 'Borrowed'
    and due_date < current_date;
end;
$$ language plpgsql security definer set search_path = public;

-- ============================================================================
-- Notification triggers
-- ============================================================================

-- Repair request created -> notify all admins
create or replace function public.notify_repair_created()
returns trigger as $$
begin
  insert into public.notifications (user_id, type, title, message, related_id)
  select id, 'repair_created', 'New repair request',
         new.title || ' was reported at ' || new.location,
         new.id
  from public.users where role = 'admin';
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_notify_repair_created
  after insert on public.repair_requests
  for each row execute function public.notify_repair_created();

-- Repair status changed -> notify the requester
create or replace function public.notify_repair_status_changed()
returns trigger as $$
begin
  if new.status <> old.status then
    insert into public.notifications (user_id, type, title, message, related_id)
    values (
      new.created_by, 'repair_status_changed', 'Repair status updated',
      new.title || ' is now ' || new.status,
      new.id
    );
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_notify_repair_status_changed
  after update on public.repair_requests
  for each row execute function public.notify_repair_status_changed();

-- Equipment request approved/rejected -> notify requester
create or replace function public.notify_equipment_reviewed()
returns trigger as $$
begin
  if new.status <> old.status and new.status in ('Approved', 'Rejected') then
    insert into public.notifications (user_id, type, title, message, related_id)
    values (
      new.requested_by,
      case when new.status = 'Approved' then 'equipment_approved' else 'equipment_rejected' end,
      'Equipment request ' || new.status,
      new.item_name || ' (x' || new.quantity || ') was ' || new.status,
      new.id
    );
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_notify_equipment_reviewed
  after update on public.equipment_requests
  for each row execute function public.notify_equipment_reviewed();

-- Booking confirmed -> notify the booker
create or replace function public.notify_booking_confirmed()
returns trigger as $$
begin
  insert into public.notifications (user_id, type, title, message, related_id)
  values (
    new.booked_by, 'booking_confirmed', 'Room booking confirmed',
    new.room_name || ' booked for ' || new.booking_date || ' ' || new.start_time || '-' || new.end_time,
    new.id
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_notify_booking_confirmed
  after insert on public.room_bookings
  for each row execute function public.notify_booking_confirmed();

-- ===== supabase/migrations/0002_row_level_security.sql =====
-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.users enable row level security;
alter table public.repair_requests enable row level security;
alter table public.equipment_requests enable row level security;
alter table public.borrow_records enable row level security;
alter table public.meeting_rooms enable row level security;
alter table public.room_bookings enable row level security;
alter table public.notifications enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable set search_path = public;

-- ---------------------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------------------
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can update any profile"
  on public.users for update
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- REPAIR REQUESTS
-- ---------------------------------------------------------------------------
create policy "Employees can view their own repair requests"
  on public.repair_requests for select
  using (created_by = auth.uid() or public.is_admin());

create policy "Employees can create repair requests"
  on public.repair_requests for insert
  with check (created_by = auth.uid());

create policy "Admins can update any repair request"
  on public.repair_requests for update
  using (public.is_admin());

create policy "Owners can update their own pending repair requests"
  on public.repair_requests for update
  using (created_by = auth.uid() and status = 'Pending');

-- ---------------------------------------------------------------------------
-- EQUIPMENT REQUESTS
-- ---------------------------------------------------------------------------
create policy "Employees can view their own equipment requests"
  on public.equipment_requests for select
  using (requested_by = auth.uid() or public.is_admin());

create policy "Employees can create equipment requests"
  on public.equipment_requests for insert
  with check (requested_by = auth.uid());

create policy "Admins can update equipment requests"
  on public.equipment_requests for update
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- BORROW RECORDS
-- ---------------------------------------------------------------------------
create policy "Employees can view their own borrow records"
  on public.borrow_records for select
  using (borrower = auth.uid() or public.is_admin());

create policy "Employees can create borrow records"
  on public.borrow_records for insert
  with check (borrower = auth.uid());

create policy "Admins can update any borrow record"
  on public.borrow_records for update
  using (public.is_admin());

create policy "Owners can return their own borrowed assets"
  on public.borrow_records for update
  using (borrower = auth.uid());

-- ---------------------------------------------------------------------------
-- MEETING ROOMS (public read-only reference data)
-- ---------------------------------------------------------------------------
create policy "Anyone authenticated can view meeting rooms"
  on public.meeting_rooms for select
  to authenticated
  using (true);

create policy "Admins can manage meeting rooms"
  on public.meeting_rooms for all
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- ROOM BOOKINGS
-- ---------------------------------------------------------------------------
create policy "Anyone authenticated can view bookings"
  on public.room_bookings for select
  to authenticated
  using (true);

create policy "Employees can create their own bookings"
  on public.room_bookings for insert
  with check (booked_by = auth.uid());

create policy "Owners or admins can delete bookings"
  on public.room_bookings for delete
  using (booked_by = auth.uid() or public.is_admin());

create policy "Owners or admins can update bookings"
  on public.room_bookings for update
  using (booked_by = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------------
create policy "Users can view their own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users can update their own notifications"
  on public.notifications for update
  using (user_id = auth.uid());

create policy "System can insert notifications"
  on public.notifications for insert
  with check (true);

-- ===== supabase/migrations/0003_storage.sql =====
-- ============================================================================
-- Storage bucket for maintenance request images
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('maintenance-images', 'maintenance-images', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload maintenance images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'maintenance-images');

create policy "Anyone can view maintenance images"
  on storage.objects for select
  using (bucket_id = 'maintenance-images');

create policy "Owners can delete their own maintenance images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'maintenance-images' and owner = auth.uid());

-- Avatars bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars');

create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- ===== supabase/migrations/0004_seed_rooms.sql =====
-- ============================================================================
-- Seed reference data: meeting rooms
-- ============================================================================

insert into public.meeting_rooms (room_name, capacity, location) values
  ('Room A', 6, '2nd Floor, East Wing'),
  ('Room B', 10, '2nd Floor, West Wing'),
  ('Room C', 20, '3rd Floor, Conference Center')
on conflict (room_name) do nothing;

-- ===== supabase/migrations/0005_secure_roles.sql =====
-- ============================================================================
-- 0005: Close privilege-escalation holes
--   1) Sign-up must NEVER trust a role sent from the browser.
--   2) Normal users must not be able to change their own role.
-- Admins are promoted via the seed script or the SQL Editor
-- (auth.uid() is null there, so the guard below allows it).
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, role, department)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'employee',
    new.raw_user_meta_data->>'department'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.prevent_role_escalation()
returns trigger as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Only admins can change user roles';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists users_prevent_role_escalation on public.users;
create trigger users_prevent_role_escalation
  before update on public.users
  for each row execute function public.prevent_role_escalation();

