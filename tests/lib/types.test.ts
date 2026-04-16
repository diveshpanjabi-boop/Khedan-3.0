import { describe, it, expect } from 'vitest'
import type { User, GameRequest, Ball } from '@/lib/types'

describe('types', () => {
  it('User type has required fields', () => {
    const user: User = {
      id: 'uuid',
      name: 'Rahul',
      phone: null,
      email: 'r@test.com',
      avatar_url: null,
      city: 'Mumbai',
      role: 'user',
      is_banned: false,
      created_at: '2026-01-01T00:00:00Z',
    }
    expect(user.role).toBe('user')
    expect(user.is_banned).toBe(false)
  })

  it('Ball type covers all extra types', () => {
    const extras: Ball['extra_type'][] = ['wide', 'noball', 'bye', 'legbye', null]
    expect(extras).toHaveLength(5)
  })

  it('Ball type covers all wicket types', () => {
    const wickets: Ball['wicket_type'][] = [
      'bowled', 'caught', 'runout', 'stumped', 'lbw', 'hitwicket', null
    ]
    expect(wickets).toHaveLength(7)
  })
})
