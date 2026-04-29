import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { LiveClient } from './LiveClient'
import { deriveInningsState, formatOvers } from '@/lib/scoring'
import type { Ball, Match, Player } from '@/lib/types'

interface Props {
  params: Promise<{ matchId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { matchId } = await params
  const supabase = await createClient()
  const { data: match } = await supabase
    .from('matches')
    .select('*, team1:teams!team1_id(name), team2:teams!team2_id(name)')
    .eq('id', matchId)
    .single()

  if (!match) return { title: 'Live Match — Khedan' }

  const { data: balls } = await supabase
    .from('balls')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at')

  const state = deriveInningsState((balls as Ball[]) || [])
  const title = `${match.team1?.name} vs ${match.team2?.name} — ${state.runs}/${state.wickets} (${formatOvers(state.legalBalls)} ov)`

  return {
    title,
    description: `Live cricket scorecard on Khedan. ${title}`,
    openGraph: { title, description: 'Follow the live match on Khedan', type: 'website' },
    twitter: { card: 'summary', title },
  }
}

export default async function LiveScorecardPage({ params }: Props) {
  const { matchId } = await params
  const supabase = await createClient()
  const { data: match } = await supabase
    .from('matches')
    .select('*, team1:teams!team1_id(name, color), team2:teams!team2_id(name, color)')
    .eq('id', matchId)
    .single()

  if (!match) notFound()

  const { data: balls } = await supabase
    .from('balls')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at')

  const { data: players } = await supabase
    .from('players')
    .select('*')
    .in('team_id', [match.team1_id, match.team2_id])

  return (
    <LiveClient
      matchId={matchId}
      match={match as Match}
      initialBalls={(balls as Ball[]) || []}
      players={(players as Player[]) || []}
    />
  )
}
