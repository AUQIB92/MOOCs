import { createClient } from '@/lib/supabase/server'
import { ExamCyclesClient } from '@/components/dashboard/admin/exam-cycles-client'

export default async function ExamCyclesPage() {
  const supabase = await createClient()

  const { data: cycles } = await supabase
    .from('exam_cycles')
    .select('*')
    .order('start_date', { ascending: false })

  return <ExamCyclesClient cycles={cycles || []} />
}
