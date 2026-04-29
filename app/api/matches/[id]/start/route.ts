import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { striker_id, non_striker_id, bowler_id } = await request.json()

  if (!striker_id || !non_striker_id || !bowler_id) {
    return NextResponse.json({ error: 'striker_id, non_striker_id, and bowler_id required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('matches')
    .update({
      status: 'live',
      current_striker_id: striker_id,
      current_non_striker_id: non_striker_id,
      current_bowler_id: bowler_id,
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
