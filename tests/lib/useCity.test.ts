import { describe, it, expect, beforeEach } from 'vitest'

describe('useCity localStorage logic', () => {
  const CITY_KEY = 'khedan_city'

  beforeEach(() => {
    localStorage.clear()
  })

  it('returns empty string when no city stored', () => {
    expect(localStorage.getItem(CITY_KEY)).toBeNull()
  })

  it('stores city in localStorage', () => {
    localStorage.setItem(CITY_KEY, 'Mumbai')
    expect(localStorage.getItem(CITY_KEY)).toBe('Mumbai')
  })

  it('updates city when called again', () => {
    localStorage.setItem(CITY_KEY, 'Mumbai')
    localStorage.setItem(CITY_KEY, 'Pune')
    expect(localStorage.getItem(CITY_KEY)).toBe('Pune')
  })
})
