import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { venue_id, date, start_time, end_time, sport, notes, total_price } = await request.json()

  if (!venue_id || !date || !start_time || !end_time || !sport || total_price == null) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Verify venue exists and is active
  const { data: venue, error: venueError } = await supabase
    .from('venues')
    .select('id, is_active')
    .eq('id', venue_id)
    .single()

  if (venueError || !venue || !venue.is_active) {
    return NextResponse.json({ error: 'Venue not available' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      venue_id,
      user_id: user.id,
      date,
      start_time,
      end_time,
      sport,
      notes: notes || null,
      total_price,
      status: 'pending',
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
