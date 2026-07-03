-- 010_public_departments_read.sql
-- The sign-up page needs to show the department picker to users who are not
-- yet authenticated (auth.role() = 'anon'). Department names/codes are not
-- sensitive, so allow anyone (logged in or not) to read them.

drop policy if exists "Departments are viewable by authenticated users" on departments;
create policy "Departments are viewable by anyone"
  on departments for select using (true);
