'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Report } from '@/lib/types'

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('reports')
        .select('*, reporter:profiles!reporter_id(name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50)
      setReports((data as Report[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  async function resolve(reportId: string, action: 'resolved' | 'dismissed') {
    setActing(reportId)
    await fetch(`/api/admin/reports/${reportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setReports(prev => prev.filter(r => r.id !== reportId))
    setActing(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports</h1>
      <p className="text-sm text-gray-500 mb-6">{reports.length} pending</p>

      {loading && <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>}

      {!loading && reports.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-gray-500">No pending reports</p>
        </div>
      )}

      <div className="space-y-3">
        {reports.map(report => (
          <div key={report.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium capitalize">
                    {report.target_type}
                  </span>
                  <span className="text-xs text-gray-400">
                    by {(report as Report & { reporter?: { name: string } }).reporter?.name ?? 'Unknown'}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{report.reason}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Target ID: {report.target_id.slice(0, 8)}...
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => resolve(report.id, 'dismissed')}
                  disabled={acting === report.id}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-medium hover:bg-gray-200 disabled:opacity-50"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => resolve(report.id, 'resolved')}
                  disabled={acting === report.id}
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-medium hover:bg-red-100 disabled:opacity-50"
                >
                  Remove Content
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
