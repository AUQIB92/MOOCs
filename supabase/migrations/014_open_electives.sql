-- 014_open_electives.sql
-- Open Elective Courses (OECs).
--
-- An OEC is a curriculum subject that is OWNED by one department (department_id)
-- but is offered to students of OTHER departments. The set of departments whose
-- students may take it is stored in open_to_departments. The owning department is
-- included in that list only if its own students are allowed to take the OEC
-- (they often are not) — visibility for OECs is governed entirely by this list,
-- not by department_id.
--
-- Ownership (department_id) is unchanged, so the existing HoD write policy
-- (department_id = current_user_department()) already lets a HoD create/manage
-- their department's OECs. No RLS changes are required.

alter table curriculum_subjects
  add column if not exists is_open_elective boolean not null default false;

alter table curriculum_subjects
  add column if not exists open_to_departments uuid[] not null default '{}';
