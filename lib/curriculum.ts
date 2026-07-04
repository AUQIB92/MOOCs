import type { CurriculumSubject } from '@/lib/types'

type VisibilityFields = Pick<
  CurriculumSubject,
  'department_id' | 'is_open_elective' | 'open_to_departments'
>

/**
 * Whether a curriculum subject is visible/takeable by a student of a given
 * department.
 *
 * - Open Elective (OEC): visible only to departments listed in
 *   `open_to_departments`. The owning department is included only if the HoD
 *   opted its own students in — so excluding it hides the OEC from own-dept
 *   students while keeping it available to others.
 * - Regular subject: visible only to its owning department.
 */
export function isSubjectVisibleToDepartment(
  subject: VisibilityFields | null | undefined,
  departmentId: string | null | undefined
): boolean {
  if (!subject || !departmentId) return false
  if (subject.is_open_elective) {
    return (subject.open_to_departments ?? []).includes(departmentId)
  }
  return subject.department_id === departmentId
}
