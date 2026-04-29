import { requireAdmin } from '@/lib/admin'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error, supabase, user: admin } = await requireAdmin()
  if (error) return error

  if (id === admin!.id) {
    return NextResponse.json({ error: 'Cannot modify your own account' }, { status: 400 })
  }

  const body = await request.json()
  const updates: Record<string, unknown> = {}

  if (typeof body.is_banned === 'boolean') updates.is_banned = body.is_banned
  if (body.role === 'user' || body.role === 'admin') updates.role = body.role
  if (body.city) updates.city = body.city

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { error: dbError } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
