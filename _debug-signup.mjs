import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPA_URL,
  process.env.SUPA_ANON_KEY
)

const run = async () => {
  console.log('--- Fetching departments ---')
  const { data: departments, error: deptError } = await supabase
    .from('departments')
    .select('*')
    .order('name')

  if (deptError) {
    console.log('DEPARTMENTS ERROR:', JSON.stringify(deptError, null, 2))
  } else {
    console.log('DEPARTMENTS COUNT:', departments.length)
    console.log(JSON.stringify(departments, null, 2))
  }

  if (!departments || departments.length === 0) {
    console.log('No departments to use for test signup, stopping.')
    return
  }

  const dept = departments[0]
  const testEmail = `debug-test-${Date.now()}@example.com`

  console.log('\n--- Attempting signUp ---')
  console.log('Using department:', dept.id, dept.name)
  console.log('Test email:', testEmail)

  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: 'TestPassword123!',
    options: {
      data: {
        full_name: 'Debug Test User',
        enrollment_number: 'DEBUG001',
        semester: 4,
        department_id: dept.id,
        role: 'student',
      },
    },
  })

  if (error) {
    console.log('SIGNUP ERROR (full object):')
    console.log(JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    console.log('status:', error.status)
    console.log('code:', error.code)
    console.log('name:', error.name)
    console.log('message:', error.message)
    if (error.cause) console.log('cause:', error.cause)
  } else {
    console.log('SIGNUP SUCCESS:', JSON.stringify(data, null, 2))
  }
}

run().catch((e) => {
  console.error('SCRIPT CRASHED:', e)
})
