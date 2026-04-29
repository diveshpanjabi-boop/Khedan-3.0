'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, Users, MapPin, Flag, Home } from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Overview', icon: BarChart2, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/venues', label: 'Venues', icon: MapPin },
  { href: '/admin/reports', label: 'Reports', icon: Flag },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">🏏 Khedan Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <Link href="/community" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
            <Home className="w-4 h-4" /> Back to App
          </Link>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10 flex overflow-x-auto">
        {NAV.map(({ href, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`shrink-0 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                active ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>

      <main className="flex-1 p-6 mt-12 md:mt-0">{children}</main>
    </div>
  )
}
