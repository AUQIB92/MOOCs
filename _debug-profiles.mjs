import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPA_URL, process.env.SUPA_ANON_KEY)

// 1. Does a plain select on profiles recurse? (detects whether the RLS
//    recursion fix migration 009 is actually applied on THIS project)
console.log('--- profiles select (anon) ---')
const t0 = Date.now()
const { data, error } = await supabase
  .from('profiles')
  .select('*, department:departments(*)')
  .limit(1)
console.log('elapsed ms:', Date.now() - t0)
if (error) console.log('ERROR:', JSON.stringify(error, null, 2))
else console.log('rows:', data.length)

// 2. The exact .single() shape the app uses, with a random id
console.log('\n--- profiles .single() by id (anon) ---')
const t1 = Date.now()
const { data: d2, error: e2 } = await supabase
  .from('profiles')
  .select('*, department:departments(*)')
  .eq('id', '00000000-0000-0000-0000-000000000000')
  .single()
console.log('elapsed ms:', Date.now() - t1)
if (e2) console.log('ERROR:', JSON.stringify(e2, null, 2))
else console.log('data:', d2)
