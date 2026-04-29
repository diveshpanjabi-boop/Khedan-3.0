import { requireAdmin } from '@/lib/admin'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { action } = await request.json()

  if (!['resolved', 'dismissed'].includes(action)) {
    return NextResponse.json({ error: 'action must be resolved or dismissed' }, { status: 400 })
  }

  const { error: dbError } = await supabase
    .from('reports')
    .update({ status: action })
    .eq('id', id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
