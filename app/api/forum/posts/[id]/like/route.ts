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

  const { data: post, error: fetchError } = await supabase
    .from('forum_posts')
    .select('likes')
    .eq('id', id)
    .single()

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const likes: string[] = post.likes || []
  const alreadyLiked = likes.includes(user.id)
  const newLikes = alreadyLiked
    ? likes.filter(uid => uid !== user.id)
    : [...likes, user.id]

  // Note: this is a read-modify-write; concurrent requests may overwrite each other.
  // For full atomicity, a Postgres array_append/array_remove RPC function would be needed.
  const { error } = await supabase
    .from('forum_posts')
    .update({ likes: newLikes })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ liked: !alreadyLiked, count: newLikes.length })
}
