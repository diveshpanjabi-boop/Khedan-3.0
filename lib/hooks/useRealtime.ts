'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtime(
  table: string,
  filterValue: string,
  onUpdate: () => void,
  filterColumn: string = 'city'
) {
  useEffect(() => {
    if (!filterValue) return

    const supabase = createClient()
    const channel = supabase
      .channel(`realtime:${table}:${filterValue}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `${filterColumn}=eq.${filterValue}` },
        () => onUpdate()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [table, filterValue, filterColumn, onUpdate])
}
