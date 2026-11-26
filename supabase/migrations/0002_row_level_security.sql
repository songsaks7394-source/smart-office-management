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
