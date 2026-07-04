-- 012_hod_role.sql
-- Introduces the Head of Department (HoD) role.
--
-- IMPORTANT: Postgres does not allow a newly added enum value to be *used*
-- in the same transaction that adds it. This migration therefore ONLY adds
-- the value; the policies that reference it live in 013_hod_policies.sql,
-- which must run in a later transaction. Keep these as separate migration files.

alter type user_role add value if not exists 'hod';
