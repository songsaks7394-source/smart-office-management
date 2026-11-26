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
