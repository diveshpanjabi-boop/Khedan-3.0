import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: post } = await supabase
    .from('forum_posts')
    .select('likes')
    .eq('id', id)
    .single()

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const likes: string[] = post.likes || []
  const alreadyLiked = likes.includes(user.id)
  const newLikes = alreadyLiked
    ? likes.filter(uid => uid !== user.id)
    : [...likes, user.id]

  const { error } = await supabase
    .from('forum_posts')
    .update({ likes: newLikes })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ liked: !alreadyLiked, count: newLikes.length })
}
