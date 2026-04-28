'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtime(table: string, city: string, onUpdate: () => void) {
  useEffect(() => {
    if (!city) return

    const supabase = createClient()
    const channel = supabase
      .channel(`realtime:${table}:${city}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `city=eq.${city}` },
        () => onUpdate()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [table, city, onUpdate])
}
