import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { team1_id, team2_id, overs, city, venue_id, tournament_id, toss_winner_id, toss_decision } = await request.json()

  if (!team1_id || !team2_id || !overs || !city) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (team1_id === team2_id) {
    return NextResponse.json({ error: 'Teams must be different' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('matches')
    .insert({
      team1_id,
      team2_id,
      overs: Number(overs),
      city,
      venue_id: venue_id || null,
      tournament_id: tournament_id || null,
      toss_winner_id: toss_winner_id || null,
      toss_decision: toss_decision || null,
      status: 'upcoming',
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
