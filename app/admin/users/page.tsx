'use client'
import { useState, useEffect } from 'react'
import { Search, ShieldAlert, ShieldCheck } from 'lucide-react'
import type { User } from '@/lib/types'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [acting, setActing] = useState<string | null>(null)

  async function load(q = search, p = page) {
    setLoading(true)
    const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}&page=${p}`)
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users)
      setTotal(data.total)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [page])

  async function toggleBan(userId: string, currentlyBanned: boolean) {
    setActing(userId)
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_banned: !currentlyBanned }),
    })
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_banned: !currentlyBanned } : u))
    setActing(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(search, 1)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <button
          onClick={() => load(search, 1)}
          className="px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700"
        >
          Search
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-5 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase border-b">
          <span className="col-span-2">User</span>
          <span>City</span>
          <span>Role</span>
          <span>Action</span>
        </div>

        {loading && (
          <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
        )}

        {!loading && users.map(user => (
          <div key={user.id} className="grid grid-cols-5 px-4 py-3 border-b border-gray-50 last:border-0 items-center text-sm">
            <div className="col-span-2">
              <p className="font-medium text-gray-900">{user.name || '—'}</p>
              <p className="text-xs text-gray-400">{user.email || user.phone || '—'}</p>
            </div>
            <span className="text-gray-600">{user.city || '—'}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${
              user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {user.role}
            </span>
            <button
              onClick={() => toggleBan(user.id, user.is_banned)}
              disabled={acting === user.id}
              className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors ${
                user.is_banned
                  ? 'bg-green-50 text-green-700 hover:bg-green-100'
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              } disabled:opacity-50`}
            >
              {user.is_banned ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
              {user.is_banned ? 'Unban' : 'Ban'}
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
        <span>{total} users total</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page * 20 >= total}
            className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
