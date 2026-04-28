'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Users, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { useCity } from '@/lib/hooks/useCity'
import { useRealtime } from '@/lib/hooks/useRealtime'
import { GameRequestCard } from '@/components/community/GameRequestCard'
import { CreateGameRequestModal } from '@/components/community/CreateGameRequestModal'
import { ManageRequestModal } from '@/components/community/ManageRequestModal'
import { ForumPost } from '@/components/community/ForumPost'
import { ForumPostModal } from '@/components/community/ForumPostModal'
import { CityPicker } from '@/components/ui/CityPicker'
import type { GameRequest, ForumPost as ForumPostType } from '@/lib/types'

type Tab = 'games' | 'forum'
type ForumCategory = 'all' | 'general' | 'match' | 'find_players' | 'tips' | 'tournament'

const FORUM_CATEGORIES: { id: ForumCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'general', label: 'General' },
  { id: 'match', label: 'Match Talk' },
  { id: 'find_players', label: 'Find Players' },
  { id: 'tips', label: 'Tips' },
  { id: 'tournament', label: 'Tournaments' },
]

export default function CommunityPage() {
  const { user } = useAuth()
  const { city } = useCity()
  const [tab, setTab] = useState<Tab>('games')
  const [gameRequests, setGameRequests] = useState<GameRequest[]>([])
  const [forumPosts, setForumPosts] = useState<ForumPostType[]>([])
  const [forumCategory, setForumCategory] = useState<ForumCategory>('all')
  const [joinedIds, setJoinedIds] = useState<string[]>([])
  const [showCreateGame, setShowCreateGame] = useState(false)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [managingId, setManagingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchGameRequests = useCallback(async () => {
    if (!city) return
    const supabase = createClient()
    const { data } = await supabase
      .from('game_requests')
      .select('*, author:profiles(id, name, avatar_url)')
      .eq('city', city)
      .neq('status', 'cancelled')
      .gte('datetime', new Date().toISOString())
      .order('datetime')
      .limit(30)
    setGameRequests((data as GameRequest[]) || [])
    setLoading(false)

    if (user) {
      const { data: joins } = await supabase
        .from('join_requests')
        .select('game_request_id')
        .eq('user_id', user.id)
      setJoinedIds((joins || []).map((j: { game_request_id: string }) => j.game_request_id))
    }
  }, [city, user])

  const fetchForumPosts = useCallback(async () => {
    if (!city) return
    const res = await fetch(`/api/forum/posts?city=${encodeURIComponent(city)}&category=${forumCategory}`)
    if (res.ok) {
      const data = await res.json()
      setForumPosts(data)
    }
    setLoading(false)
  }, [city, forumCategory])

  useEffect(() => {
    setLoading(true)
    if (tab === 'games') fetchGameRequests()
    else fetchForumPosts()
  }, [tab, fetchGameRequests, fetchForumPosts])

  useRealtime('game_requests', city ?? '', fetchGameRequests)
  useRealtime('forum_posts', city ?? '', fetchForumPosts)

  async function handleJoin(gameRequestId: string) {
    await fetch(`/api/game-requests/${gameRequestId}/join`, { method: 'POST' })
    setJoinedIds(prev => [...prev, gameRequestId])
  }

  async function handleLike(postId: string) {
    if (!user) return
    const res = await fetch(`/api/forum/posts/${postId}/like`, { method: 'POST' })
    if (res.ok) {
      const { liked } = await res.json()
      setForumPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, likes: liked ? [...p.likes, user.id] : p.likes.filter(id => id !== user.id) }
          : p
      ))
    }
  }

  if (!city) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="text-4xl mb-4">📍</div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Pick your city</h2>
        <p className="text-gray-500 text-sm mb-6">See games and posts near you</p>
        <CityPicker />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <CityPicker />
        <button
          onClick={() => tab === 'games' ? setShowCreateGame(true) : setShowCreatePost(true)}
          className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          {tab === 'games' ? 'Post Game' : 'New Post'}
        </button>
      </div>

      {/* Tab switcher */}
      <div className="bg-white border-b border-gray-100 flex">
        <button
          onClick={() => setTab('games')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'games' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'
          }`}
        >
          <Users className="w-4 h-4" /> Game Requests
        </button>
        <button
          onClick={() => setTab('forum')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'forum' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Forum
        </button>
      </div>

      {/* Forum category chips */}
      {tab === 'forum' && (
        <div className="bg-white px-4 py-2 flex gap-2 overflow-x-auto border-b border-gray-100">
          {FORUM_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setForumCategory(cat.id)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                forumCategory === cat.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {loading && (
          <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
        )}

        {!loading && tab === 'games' && gameRequests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🏏</div>
            <p className="text-gray-500 text-sm">No games posted in {city} yet.</p>
            <p className="text-gray-400 text-xs mt-1">Be the first to post one!</p>
          </div>
        )}

        {!loading && tab === 'games' && gameRequests.map(req => (
          <GameRequestCard
            key={req.id}
            request={req}
            currentUserId={user?.id ?? null}
            joinedRequestIds={joinedIds}
            onJoin={handleJoin}
            onManage={setManagingId}
          />
        ))}

        {!loading && tab === 'forum' && forumPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-gray-500 text-sm">No posts yet. Start the conversation!</p>
          </div>
        )}

        {!loading && tab === 'forum' && forumPosts.map(post => (
          <ForumPost
            key={post.id}
            post={post}
            currentUserId={user?.id ?? null}
            onLike={handleLike}
            onOpen={() => {/* detail view — future extension */}}
          />
        ))}
      </div>

      {/* Modals */}
      {showCreateGame && (
        <CreateGameRequestModal
          onClose={() => setShowCreateGame(false)}
          onCreated={fetchGameRequests}
        />
      )}
      {showCreatePost && (
        <ForumPostModal
          onClose={() => setShowCreatePost(false)}
          onCreated={fetchForumPosts}
        />
      )}
      {managingId && (
        <ManageRequestModal
          gameRequestId={managingId}
          onClose={() => setManagingId(null)}
          onUpdated={fetchGameRequests}
        />
      )}
    </div>
  )
}
