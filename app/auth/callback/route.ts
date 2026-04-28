import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url))
  }

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !user) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error?.message ?? 'auth_failed')}`, request.url))
  }

  const { data: profile } = await supabase.from('profiles').select('city, name').eq('id', user.id).single()
  if (!profile?.city || !profile?.name) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  return NextResponse.redirect(new URL('/community', request.url))
}
