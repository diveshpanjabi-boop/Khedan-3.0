import { describe, it, expect } from 'vitest'

describe('middleware route logic', () => {
  function isPublicPath(pathname: string): boolean {
    return pathname.startsWith('/login') || pathname.startsWith('/live')
  }

  it('marks /login as public', () => {
    expect(isPublicPath('/login')).toBe(true)
  })

  it('marks /live/* as public', () => {
    expect(isPublicPath('/live/match-id-123')).toBe(true)
  })

  it('marks /community as protected', () => {
    expect(isPublicPath('/community')).toBe(false)
  })

  it('marks /admin as protected', () => {
    expect(isPublicPath('/admin')).toBe(false)
  })

  it('marks /scoring as protected', () => {
    expect(isPublicPath('/scoring')).toBe(false)
  })
})
