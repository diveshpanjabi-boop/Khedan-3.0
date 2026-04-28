'use client'
import { useState, useEffect } from 'react'
import { X, Check, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { JoinRequest } from '@/lib/types'

interface Props {
  gameRequestId: string
  onClose: () => void
  onUpdated: () => void
}

export function ManageRequestModal({ gameRequestId, onClose, onUpdated }: Props) {
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('join_requests')
        .select('*, user:profiles(id, name, avatar_url)')
        .eq('game_request_id', gameRequestId)
        .order('created_at')
      setJoinRequests((data as JoinRequest[]) || [])
      setLoading(false)
    }
    load()
  }, [gameRequestId])

  async function respond(joinRequestId: string, action: 'accepted' | 'rejected') {
    setResponding(joinRequestId)
    await fetch(`/api/game-requests/${gameRequestId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ join_request_id: joinRequestId, action }),
    })
    setJoinRequests(prev =>
      prev.map(r => r.id === joinRequestId ? { ...r, status: action } : r)
    )
    setResponding(null)
    onUpdated()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white rounded-t-3xl w-full max-w-lg mx-auto p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Join Requests</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading && <p className="text-gray-500 text-sm text-center py-4">Loading...</p>}

        {!loading && joinRequests.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">No requests yet</p>
        )}

        <div className="space-y-3">
          {joinRequests.map(req => (
            <div key={req.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-900 text-sm">{req.user?.name ?? 'Unknown'}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {req.status === 'pending' ? 'Waiting' :
                   req.status === 'accepted' ? '✅ Accepted' : '❌ Rejected'}
                </p>
              </div>
              {req.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => respond(req.id, 'rejected')}
                    disabled={responding === req.id}
                    className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => respond(req.id, 'accepted')}
                    disabled={responding === req.id}
                    className="p-2 rounded-full hover:bg-green-50 text-green-600 transition-colors"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
