import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: gameRequest } = await supabase
    .from('game_requests')
    .select('status, author_id, filled_spots, total_spots')
    .eq('id', id)
    .single()

  if (!gameRequest) {
    return NextResponse.json({ error: 'Game request not found' }, { status: 404 })
  }

  if (gameRequest.status !== 'open') {
    return NextResponse.json({ error: 'Game is no longer open for requests' }, { status: 400 })
  }

  if (gameRequest.filled_spots >= gameRequest.total_spots) {
    return NextResponse.json({ error: 'Game is at capacity' }, { status: 400 })
  }

  if (gameRequest.author_id === user.id) {
    return NextResponse.json({ error: 'Cannot join your own game' }, { status: 400 })
  }

  const { error } = await supabase
    .from('join_requests')
    .insert({ game_request_id: id, user_id: user.id })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already requested to join' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
