import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Create a Head of Department account in one step (admin only).
 *
 * Creates a confirmed auth user via the service-role admin API, then upserts
 * the profile with role='hod' and the chosen department. The signup trigger
 * also derives these from user metadata; the upsert guarantees them regardless.
 */
export async function POST(request: Request) {
  // 1. Authenticate the caller and confirm they are an admin.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 })
  }

  const { data: caller } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (caller?.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can add HoDs.' }, { status: 403 })
  }

  // 2. Validate input.
  let body: {
    full_name?: string
    email?: string
    password?: string
    department_id?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const full_name = (body.full_name ?? '').trim()
  const email = (body.email ?? '').trim().toLowerCase()
  const password = body.password ?? ''
  const department_id = (body.department_id ?? '').trim()

  if (!full_name || !email || !department_id) {
    return NextResponse.json(
      { error: 'Full name, email and department are required.' },
      { status: 400 }
    )
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: 'Password must be at least 6 characters.' },
      { status: 400 }
    )
  }

  // 3. Create the user with the service-role client.
  let admin
  try {
    admin = createAdminClient()
  } catch {
    return NextResponse.json(
      {
        error:
          'Server is not configured to create users. Set SUPABASE_SERVICE_ROLE_KEY in your environment.',
      },
      { status: 500 }
    )
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role: 'hod', department_id },
  })

  if (createError || !created?.user) {
    const message = createError?.message ?? 'Failed to create user.'
    console.error('[add-hod] createUser failed:', message, createError)

    // The signup trigger casts the metadata role to the user_role enum. If the
    // HoD migrations haven't been applied, `'hod'::user_role` fails and Supabase
    // returns a generic "Database error creating new user".
    if (/database error|user_role|enum|hod/i.test(message)) {
      return NextResponse.json(
        {
          error:
            "Account could not be created. Apply the HoD database migrations (012–014) first — the 'hod' role likely doesn't exist in the database yet.",
        },
        { status: 400 }
      )
    }

    const status = /already|exists|registered/i.test(message) ? 409 : 400
    return NextResponse.json({ error: message }, { status })
  }

  // 4. Guarantee the profile reflects HoD role + department.
  const { error: profileError } = await admin
    .from('profiles')
    .upsert(
      { id: created.user.id, email, full_name, role: 'hod', department_id },
      { onConflict: 'id' }
    )

  if (profileError) {
    console.error('[add-hod] profile upsert failed:', profileError.message)
    return NextResponse.json(
      { error: 'Account created but profile setup failed: ' + profileError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, id: created.user.id })
}
