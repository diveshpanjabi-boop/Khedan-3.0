import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GameRequestCard } from '@/components/community/GameRequestCard'
import type { GameRequest } from '@/lib/types'

const baseRequest: GameRequest = {
  id: 'req-1',
  author_id: 'user-1',
  city: 'Mumbai',
  venue_id: null,
  venue_name: 'Shivaji Park',
  sport: 'Cricket',
  datetime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
  total_spots: 7,
  filled_spots: 5,
  description: 'Gully rules, bring water',
  status: 'open',
  created_at: new Date().toISOString(),
}

describe('GameRequestCard', () => {
  it('renders sport and venue', () => {
    render(<GameRequestCard request={baseRequest} currentUserId="user-2" onJoin={vi.fn()} onManage={vi.fn()} />)
    expect(screen.getByText('Cricket')).toBeTruthy()
    expect(screen.getByText('Shivaji Park')).toBeTruthy()
  })

  it('shows spots remaining', () => {
    render(<GameRequestCard request={baseRequest} currentUserId="user-2" onJoin={vi.fn()} onManage={vi.fn()} />)
    expect(screen.getByText(/2 spots left/i)).toBeTruthy()
  })

  it('shows Join button for non-author', () => {
    render(<GameRequestCard request={baseRequest} currentUserId="user-2" onJoin={vi.fn()} onManage={vi.fn()} />)
    expect(screen.getByRole('button', { name: /request to join/i })).toBeTruthy()
  })

  it('shows Manage button for author', () => {
    render(<GameRequestCard request={baseRequest} currentUserId="user-1" onJoin={vi.fn()} onManage={vi.fn()} />)
    expect(screen.getByRole('button', { name: /manage/i })).toBeTruthy()
  })

  it('shows Full badge when status is full', () => {
    const fullRequest = { ...baseRequest, status: 'full' as const }
    render(<GameRequestCard request={fullRequest} currentUserId="user-2" onJoin={vi.fn()} onManage={vi.fn()} />)
    expect(screen.getByText(/full/i)).toBeTruthy()
  })

  it('calls onJoin when Join button clicked', async () => {
    const onJoin = vi.fn()
    render(<GameRequestCard request={baseRequest} currentUserId="user-2" onJoin={onJoin} onManage={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /request to join/i }))
    expect(onJoin).toHaveBeenCalledWith('req-1')
  })
})
