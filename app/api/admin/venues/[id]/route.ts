import { requireAdmin } from '@/lib/admin'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const body = await request.json()
  const updates: Record<string, unknown> = {}

  if (typeof body.is_active === 'boolean') updates.is_active = body.is_active

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields' }, { status: 400 })
  }

  const { error: dbError } = await supabase
    .from('venues')
    .update(updates)
    .eq('id', id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
