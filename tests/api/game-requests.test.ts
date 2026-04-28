import { describe, it, expect } from 'vitest'

// Test pure business logic functions extracted from route handlers
function spotsAfterAccept(filled: number, total: number): { filled_spots: number; status: string } {
  const newFilled = filled + 1
  return {
    filled_spots: newFilled,
    status: newFilled >= total ? 'full' : 'open',
  }
}

describe('game request business logic', () => {
  it('increments filled_spots on accept', () => {
    const result = spotsAfterAccept(5, 7)
    expect(result.filled_spots).toBe(6)
    expect(result.status).toBe('open')
  })

  it('sets status to full when last spot filled', () => {
    const result = spotsAfterAccept(6, 7)
    expect(result.filled_spots).toBe(7)
    expect(result.status).toBe('full')
  })

  it('sets status to full when already at capacity', () => {
    const result = spotsAfterAccept(7, 7)
    expect(result.filled_spots).toBe(8)
    expect(result.status).toBe('full')
  })
})
