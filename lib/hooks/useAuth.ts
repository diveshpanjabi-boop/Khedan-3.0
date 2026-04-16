'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/lib/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function loadUser(userId: string) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      setUser(data)
    }

    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) {
        loadUser(authUser.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadUser(session.user.id)
        } else {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
