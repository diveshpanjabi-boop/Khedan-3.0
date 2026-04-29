import { describe, it, expect } from 'vitest'

// Test pure admin authorization logic
function isAdmin(role: string): boolean {
  return role === 'admin'
}

function canBanUser(adminId: string, targetId: string): boolean {
  return adminId !== targetId // admins cannot ban themselves
}

describe('admin authorization logic', () => {
  it('admin role is recognized', () => {
    expect(isAdmin('admin')).toBe(true)
  })

  it('user role is not admin', () => {
    expect(isAdmin('user')).toBe(false)
  })

  it('admin cannot ban themselves', () => {
    expect(canBanUser('admin-1', 'admin-1')).toBe(false)
  })

  it('admin can ban other users', () => {
    expect(canBanUser('admin-1', 'user-2')).toBe(true)
  })
})
