import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const MAX_COMMENT_LENGTH = 2000

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('forum_comments')
    .select('*, author:profiles(id, name, avatar_url)')
    .eq('post_id', id)
    .order('created_at')
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content } = await request.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })
  if (content.trim().length > MAX_COMMENT_LENGTH) {
    return NextResponse.json({ error: `Content must be ${MAX_COMMENT_LENGTH} characters or less` }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('forum_comments')
    .insert({ post_id: id, author_id: user.id, content: content.trim() })
    .select('*, author:profiles(id, name, avatar_url)')
    .single()

  if (error) {
    // FK violation: post doesn't exist
    if (error.code === '23503') return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
