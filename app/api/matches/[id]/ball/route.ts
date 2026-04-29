import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { ExtraType, WicketType } from '@/lib/types'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const {
    innings,
    over_num,
    ball_num,
    batsman_id,
    bowler_id,
    runs,
    extras,
    extra_type,
    wicket_type,
    dismissed_player_id,
    new_striker_id,
    new_non_striker_id,
    new_bowler_id,
  } = await request.json()

  // Record the ball
  const { error: ballError } = await supabase
    .from('balls')
    .insert({
      match_id: id,
      innings,
      over_num,
      ball_num,
      batsman_id,
      bowler_id,
      runs: runs ?? 0,
      extras: extras ?? 0,
      extra_type: (extra_type as ExtraType) ?? null,
      wicket_type: (wicket_type as WicketType) ?? null,
      dismissed_player_id: dismissed_player_id ?? null,
    })

  if (ballError) return NextResponse.json({ error: ballError.message }, { status: 500 })

  // Update current players if provided
  const updates: Record<string, string | null> = {}
  if (new_striker_id !== undefined) updates.current_striker_id = new_striker_id
  if (new_non_striker_id !== undefined) updates.current_non_striker_id = new_non_striker_id
  if (new_bowler_id !== undefined) updates.current_bowler_id = new_bowler_id

  if (Object.keys(updates).length > 0) {
    await supabase.from('matches').update(updates).eq('id', id)
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
