'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Trophy, MapPin, User } from 'lucide-react'

const NAV = [
  { href: '/community', label: 'Community', icon: Users },
  { href: '/scoring', label: 'Scoring', icon: Trophy },
  { href: '/venues', label: 'Venues', icon: MapPin },
  { href: '/profile', label: 'Profile', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-50 safe-area-pb">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link key={href} href={href} className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors ${active ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
