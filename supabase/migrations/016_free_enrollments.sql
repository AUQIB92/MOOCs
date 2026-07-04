-- 016_free_enrollments.sql
-- Recording a MOOC enrollment no longer requires approval. Enrollments are
-- recorded and active immediately; verification happens later at the
-- results/certificate stage.
--
-- 1) New registrations default to 'approved'.
-- 2) Clear the existing backlog of pending enrollments.

alter table registrations alter column status set default 'approved';

update registrations
set status = 'approved',
    approved_at = coalesce(approved_at, now())
where status = 'pending';
