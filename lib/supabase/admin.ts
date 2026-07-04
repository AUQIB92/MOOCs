import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client for privileged, SERVER-ONLY operations such as
 * creating auth users. It bypasses Row Level Security, so it must never be
 * imported into a client component or exposed to the browser — only import it
 * from route handlers / server actions. It relies on SUPABASE_SERVICE_ROLE_KEY,
 * which has no NEXT_PUBLIC_ prefix and therefore is never sent to the browser.
 *
 * Throws if SUPABASE_SERVICE_ROLE_KEY is missing or still the placeholder, so
 * callers can surface a clear "not configured" message instead of a cryptic
 * auth failure.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey || serviceKey === 'your_service_role_key_here') {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
