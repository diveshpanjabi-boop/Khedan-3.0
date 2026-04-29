import { describe, it, expect } from 'vitest'
import { deriveInningsState, formatOvers } from '@/lib/scoring'
import type { Ball } from '@/lib/types'

function makeBall(overrides: Partial<Ball> = {}): Ball {
  return {
    id: 'b1',
    match_id: 'm1',
    innings: 1,
    over_num: 1,
    ball_num: 1,
    batsman_id: 'bat1',
    bowler_id: 'bowl1',
    runs: 0,
    extras: 0,
    extra_type: null,
    wicket_type: null,
    dismissed_player_id: null,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

describe('deriveInningsState', () => {
  it('starts at 0/0', () => {
    const state = deriveInningsState([])
    expect(state.runs).toBe(0)
    expect(state.wickets).toBe(0)
    expect(state.legalBalls).toBe(0)
  })

  it('counts legal balls (not wides/noballs)', () => {
    const balls = [
      makeBall({ over_num: 1, ball_num: 1, runs: 1 }),
      makeBall({ over_num: 1, ball_num: 2, runs: 4 }),
      makeBall({ over_num: 1, ball_num: 3, extras: 1, extra_type: 'wide' }),
    ]
    const state = deriveInningsState(balls)
    expect(state.legalBalls).toBe(2)
    expect(state.runs).toBe(6)
  })

  it('counts wickets', () => {
    const balls = [
      makeBall({ wicket_type: 'bowled', dismissed_player_id: 'bat1' }),
      makeBall({ wicket_type: 'caught', dismissed_player_id: 'bat2' }),
    ]
    const state = deriveInningsState(balls)
    expect(state.wickets).toBe(2)
  })

  it('calculates run rate', () => {
    const balls = Array.from({ length: 6 }, (_, i) =>
      makeBall({ over_num: 1, ball_num: i + 1, runs: 1 })
    )
    const state = deriveInningsState(balls)
    expect(state.runRate).toBeCloseTo(6, 1)
  })

  it('ignores wide and noball from legal ball count', () => {
    const balls = [
      makeBall({ extra_type: 'wide', extras: 1 }),
      makeBall({ extra_type: 'noball', extras: 1 }),
      makeBall({ ball_num: 1, runs: 0 }),
    ]
    const state = deriveInningsState(balls)
    expect(state.legalBalls).toBe(1)
  })
})

describe('formatOvers', () => {
  it('formats 6 balls as 1.0', () => expect(formatOvers(6)).toBe('1.0'))
  it('formats 7 balls as 1.1', () => expect(formatOvers(7)).toBe('1.1'))
  it('formats 0 balls as 0.0', () => expect(formatOvers(0)).toBe('0.0'))
  it('formats 11 balls as 1.5', () => expect(formatOvers(11)).toBe('1.5'))
})
