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

  const { error: updateError } = await supabase
    .from('join_requests')
    .update({ status: action })
    .eq('id', join_request_id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  if (action === 'accepted') {
    const newFilled = gameRequest.filled_spots + 1
    const newStatus = newFilled >= gameRequest.total_spots ? 'full' : 'open'

    await supabase
      .from('game_requests')
      .update({ filled_spots: newFilled, status: newStatus })
      .eq('id', id)
  }

  return NextResponse.json({ success: true })
}
