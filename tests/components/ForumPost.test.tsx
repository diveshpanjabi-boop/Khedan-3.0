import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ForumPost } from '@/components/community/ForumPost'
import type { ForumPost as ForumPostType } from '@/lib/types'

const post: ForumPostType = {
  id: 'post-1',
  author_id: 'user-1',
  city: 'Mumbai',
  category: 'general',
  title: 'Who is playing this Sunday?',
  content: 'Looking for 3 more players',
  is_pinned: false,
  likes: ['user-2', 'user-3'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  comments_count: 5,
  author: { id: 'user-1', name: 'Rahul', phone: null, email: null, avatar_url: null, city: 'Mumbai', role: 'user', is_banned: false, created_at: '' },
}

describe('ForumPost', () => {
  it('renders title and author', () => {
    render(<ForumPost post={post} currentUserId="user-2" onLike={vi.fn()} onOpen={vi.fn()} />)
    expect(screen.getByText('Who is playing this Sunday?')).toBeTruthy()
    expect(screen.getByText('Rahul')).toBeTruthy()
  })

  it('shows like count', () => {
    render(<ForumPost post={post} currentUserId="user-2" onLike={vi.fn()} onOpen={vi.fn()} />)
    expect(screen.getByText('2')).toBeTruthy()
  })

  it('shows comment count', () => {
    render(<ForumPost post={post} currentUserId="user-2" onLike={vi.fn()} onOpen={vi.fn()} />)
    expect(screen.getByText('5')).toBeTruthy()
  })

  it('shows pinned badge when pinned', () => {
    const pinned = { ...post, is_pinned: true }
    render(<ForumPost post={pinned} currentUserId="user-2" onLike={vi.fn()} onOpen={vi.fn()} />)
    expect(screen.getByText(/pinned/i)).toBeTruthy()
  })
})
