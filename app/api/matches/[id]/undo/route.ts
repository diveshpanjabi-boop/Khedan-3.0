import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get last ball for this match
  const { data: lastBall } = await supabase
    .from('balls')
    .select('id')
    .eq('match_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!lastBall) {
    return NextResponse.json({ error: 'No balls to undo' }, { status: 400 })
  }

  const { error } = await supabase
    .from('balls')
    .delete()
    .eq('id', lastBall.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
