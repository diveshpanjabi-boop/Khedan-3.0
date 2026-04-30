'use client'
import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    async function handleCallback() {
      const code = searchParams.get('code')
      const supabase = createClient()

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          router.replace(`/login?error=${encodeURIComponent(error.message)}`)
          return
        }
      }

      // Wait for session to propagate then check profile
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login?error=auth_failed')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('city, name')
        .eq('id', user.id)
        .single()

      if (!profile?.city || !profile?.name) {
        router.replace('/onboarding')
      } else {
        router.replace('/community')
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="text-4xl mb-3">🏏</div>
        <p className="text-gray-500 text-sm">Completing sign in…</p>
      </div>
    </div>
  )
}
