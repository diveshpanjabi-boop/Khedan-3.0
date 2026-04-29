import { requireAdmin } from '@/lib/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const [users, matches, venues, reports, liveMatches] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('matches').select('id', { count: 'exact', head: true }),
    supabase.from('venues').select('id', { count: 'exact', head: true }),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'live'),
  ])

  return NextResponse.json({
    totalUsers: users.count ?? 0,
    totalMatches: matches.count ?? 0,
    totalVenues: venues.count ?? 0,
    pendingReports: reports.count ?? 0,
    liveMatches: liveMatches.count ?? 0,
  })
}
