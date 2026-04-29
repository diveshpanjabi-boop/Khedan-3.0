import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Activity, MapPin, Flag, Zap } from 'lucide-react'

export default async function AdminOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/community')

  const [usersCount, matchesCount, venuesCount, reportsCount, liveCount] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('matches').select('id', { count: 'exact', head: true }),
    supabase.from('venues').select('id', { count: 'exact', head: true }),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'live'),
  ])

  const stats = [
    { label: 'Total Users', value: usersCount.count ?? 0, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Matches', value: matchesCount.count ?? 0, icon: Activity, color: 'bg-green-50 text-green-600' },
    { label: 'Total Venues', value: venuesCount.count ?? 0, icon: MapPin, color: 'bg-purple-50 text-purple-600' },
    { label: 'Pending Reports', value: reportsCount.count ?? 0, icon: Flag, color: 'bg-red-50 text-red-600' },
    { label: 'Live Matches', value: liveCount.count ?? 0, icon: Zap, color: 'bg-orange-50 text-orange-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
