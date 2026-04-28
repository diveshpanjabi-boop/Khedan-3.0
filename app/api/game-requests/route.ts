import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { venue_name, sport, datetime, total_spots, description, city } = body

  if (!venue_name || !sport || !datetime || !total_spots || !city) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const spotsNum = Number(total_spots)
  if (!Number.isInteger(spotsNum) || spotsNum < 1 || spotsNum > 100) {
    return NextResponse.json({ error: 'total_spots must be an integer between 1 and 100' }, { status: 400 })
  }

  const dt = new Date(datetime)
  if (isNaN(dt.getTime()) || dt <= new Date()) {
    return NextResponse.json({ error: 'datetime must be a valid future date' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('game_requests')
    .insert({
      author_id: user.id,
      city,
      venue_name,
      sport,
      datetime,
      total_spots: spotsNum,
      description: description || null,
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
