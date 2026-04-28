import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const VALID_CATEGORIES = new Set(['general', 'match', 'find_players', 'tips', 'tournament'])
const MAX_TITLE_LENGTH = 200
const MAX_CONTENT_LENGTH = 5000

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city') || ''
  const category = searchParams.get('category') || 'all'

  if (!city) return NextResponse.json({ error: 'city is required' }, { status: 400 })

  const supabase = await createClient()

  let query = supabase
    .from('forum_posts')
    .select('*, author:profiles(id, name, avatar_url)')
    .eq('city', city)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  if (category !== 'all') {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, content, category, city } = await request.json()

  if (!title?.trim() || !content?.trim() || !city) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (title.trim().length > MAX_TITLE_LENGTH) {
    return NextResponse.json({ error: `Title must be ${MAX_TITLE_LENGTH} characters or less` }, { status: 400 })
  }

  if (content.trim().length > MAX_CONTENT_LENGTH) {
    return NextResponse.json({ error: `Content must be ${MAX_CONTENT_LENGTH} characters or less` }, { status: 400 })
  }

  const resolvedCategory = VALID_CATEGORIES.has(category) ? category : 'general'

  const { data, error } = await supabase
    .from('forum_posts')
    .insert({ author_id: user.id, title: title.trim(), content: content.trim(), category: resolvedCategory, city })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
