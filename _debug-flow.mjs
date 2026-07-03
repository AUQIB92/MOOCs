import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPA_URL
const key = process.env.SUPA_ANON_KEY

const email = `flowtest-${Date.now()}@example.com`
const password = 'TestPassword123!'

// --- 1. Sign up ---
const a = createClient(url, key)
const depts = await a.from('departments').select('id').limit(1)
const deptId = depts.data?.[0]?.id

console.log('--- signUp ---')
const { data: signUpData, error: signUpErr } = await a.auth.signUp({
  email, password,
  options: { data: { full_name: 'Flow Test', enrollment_number: 'FLOW001', semester: 4, department_id: deptId, role: 'student' } },
})
if (signUpErr) { console.log('SIGNUP ERROR:', JSON.stringify(signUpErr, Object.getOwnPropertyNames(signUpErr), 2)); }
else {
  console.log('signUp ok. session present?', !!signUpData.session, '| user id:', signUpData.user?.id)
  console.log('email_confirmed_at:', signUpData.user?.email_confirmed_at)
  console.log('confirmation_sent_at:', signUpData.user?.confirmation_sent_at)
}

// --- 2. Try to sign in ---
const b = createClient(url, key)
console.log('\n--- signInWithPassword ---')
const t0 = Date.now()
const { data: signInData, error: signInErr } = await b.auth.signInWithPassword({ email, password })
console.log('elapsed ms:', Date.now() - t0)
if (signInErr) { console.log('SIGNIN ERROR:', JSON.stringify(signInErr, Object.getOwnPropertyNames(signInErr), 2)); }
else {
  console.log('signIn ok. session present?', !!signInData.session)
  const uid = signInData.user.id
  console.log('\n--- fetch own profile (authenticated) ---')
  const t1 = Date.now()
  const { data: prof, error: profErr } = await b.from('profiles').select('*, department:departments(*)').eq('id', uid).single()
  console.log('elapsed ms:', Date.now() - t1)
  if (profErr) console.log('PROFILE ERROR:', JSON.stringify(profErr, null, 2))
  else console.log('PROFILE:', JSON.stringify(prof, null, 2))
}
