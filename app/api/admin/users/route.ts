import { requireAdmin } from '@/lib/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  const { data, count, error: dbError } = await query
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json({ users: data, total: count, page, limit })
}
