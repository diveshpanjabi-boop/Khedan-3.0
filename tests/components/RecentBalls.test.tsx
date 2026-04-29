import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RecentBalls } from '@/components/scoring/RecentBalls'
import type { Ball } from '@/lib/types'

function makeBall(overrides: Partial<Ball>): Ball {
  return {
    id: Math.random().toString(),
    match_id: 'm1', innings: 1, over_num: 1, ball_num: 1,
    batsman_id: 'b1', bowler_id: 'bwl1',
    runs: 0, extras: 0, extra_type: null, wicket_type: null,
    dismissed_player_id: null, created_at: '',
    ...overrides,
  }
}

describe('RecentBalls', () => {
  it('renders dot ball as "·"', () => {
    render(<RecentBalls balls={[makeBall({ runs: 0 })]} />)
    expect(screen.getByText('·')).toBeTruthy()
  })

  it('renders wicket as "W"', () => {
    render(<RecentBalls balls={[makeBall({ wicket_type: 'bowled' })]} />)
    expect(screen.getByText('W')).toBeTruthy()
  })

  it('renders wide as "Wd"', () => {
    render(<RecentBalls balls={[makeBall({ extra_type: 'wide', extras: 1 })]} />)
    expect(screen.getByText('Wd')).toBeTruthy()
  })

  it('renders four with green background class', () => {
    const { container } = render(<RecentBalls balls={[makeBall({ runs: 4 })]} />)
    const ball = container.querySelector('.bg-green-100')
    expect(ball).toBeTruthy()
  })

  it('shows last 12 balls only', () => {
    const balls = Array.from({ length: 15 }, (_, i) => makeBall({ runs: 1, id: String(i) }))
    const { container } = render(<RecentBalls balls={balls} />)
    const dots = container.querySelectorAll('[data-testid="ball-dot"]')
    expect(dots.length).toBeLessThanOrEqual(12)
  })
})
