import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { join_request_id, action } = await request.json()

  if (!join_request_id || !['accepted', 'rejected'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { data: gameRequest } = await supabase
    .from('game_requests')
    .select('author_id, filled_spots, total_spots')
    .eq('id', id)
    .single()

  if (!gameRequest || gameRequest.author_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Scope the update to join_requests that belong to this game (prevents IDOR)
  const { error: updateError, count } = await supabase
    .from('join_requests')
    .update({ status: action })
    .eq('id', join_request_id)
    .eq('game_request_id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  if (count === 0) {
    return NextResponse.json({ error: 'Join request not found for this game' }, { status: 404 })
  }

  if (action === 'accepted') {
    const newFilled = gameRequest.filled_spots + 1
    const newStatus = newFilled >= gameRequest.total_spots ? 'full' : 'open'

    // Use optimistic lock on filled_spots to guard against concurrent accepts
    const { error: gameUpdateError, count: updateCount } = await supabase
      .from('game_requests')
      .update({ filled_spots: newFilled, status: newStatus })
      .eq('id', id)
      .eq('filled_spots', gameRequest.filled_spots)

    if (gameUpdateError) {
      return NextResponse.json({ error: gameUpdateError.message }, { status: 500 })
    }

    if (updateCount === 0) {
      return NextResponse.json({ error: 'Concurrent update conflict, please retry' }, { status: 409 })
    }
  }

  return NextResponse.json({ success: true })
}
