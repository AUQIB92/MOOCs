import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPA_URL, process.env.SUPA_ANON_KEY)

const { data, error } = await supabase
  .from('_debug_signup_log')
  .select('*')
  .order('id', { ascending: false })
  .limit(10)

if (error) {
  console.log('READ ERROR:', JSON.stringify(error, null, 2))
} else {
  console.log('DEBUG LOG ROWS:', data.length)
  console.log(JSON.stringify(data, null, 2))
}
