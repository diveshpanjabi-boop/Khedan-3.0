import type { Ball } from '@/lib/types'

export interface InningsState {
  runs: number
  wickets: number
  legalBalls: number
  runRate: number
  overRuns: Record<number, number>  // over_num -> runs in that over
}

export function deriveInningsState(balls: Ball[]): InningsState {
  let runs = 0
  let wickets = 0
  let legalBalls = 0
  const overRuns: Record<number, number> = {}

  for (const ball of balls) {
    const isWide = ball.extra_type === 'wide'
    const isNoBall = ball.extra_type === 'noball'
    const isLegal = !isWide && !isNoBall

    runs += ball.runs + ball.extras
    if (isLegal) legalBalls++
    if (ball.wicket_type) wickets++

    const over = ball.over_num
    overRuns[over] = (overRuns[over] ?? 0) + ball.runs + ball.extras
  }

  const overs = legalBalls / 6
  const runRate = overs > 0 ? runs / overs : 0

  return { runs, wickets, legalBalls, runRate: Math.round(runRate * 100) / 100, overRuns }
}

export function formatOvers(legalBalls: number): string {
  const completedOvers = Math.floor(legalBalls / 6)
  const ballsInOver = legalBalls % 6
  return `${completedOvers}.${ballsInOver}`
}

export interface BatsmanStats {
  playerId: string
  runs: number
  balls: number
  fours: number
  sixes: number
  strikeRate: number
  isOut: boolean
  wicketType: string | null
}

export function deriveBatsmanStats(balls: Ball[], batsmanId: string): BatsmanStats {
  const faced = balls.filter(b => b.batsman_id === batsmanId && b.extra_type !== 'wide')
  const runs = faced.reduce((sum, b) => sum + b.runs, 0)
  const ballCount = faced.filter(b => b.extra_type !== 'noball').length
  const fours = faced.filter(b => b.runs === 4).length
  const sixes = faced.filter(b => b.runs === 6).length
  const wicketBall = balls.find(b => b.dismissed_player_id === batsmanId)

  return {
    playerId: batsmanId,
    runs,
    balls: ballCount,
    fours,
    sixes,
    strikeRate: ballCount > 0 ? Math.round((runs / ballCount) * 100) : 0,
    isOut: !!wicketBall,
    wicketType: wicketBall?.wicket_type ?? null,
  }
}

export interface BowlerStats {
  playerId: string
  overs: string
  runs: number
  wickets: number
  economy: number
}

export function deriveBowlerStats(balls: Ball[], bowlerId: string): BowlerStats {
  const bowled = balls.filter(b => b.bowler_id === bowlerId)
  const legalBalls = bowled.filter(b => b.extra_type !== 'wide' && b.extra_type !== 'noball').length
  const runs = bowled.reduce((sum, b) => sum + b.runs + b.extras, 0)
  const wickets = bowled.filter(b => b.wicket_type && b.wicket_type !== 'runout').length
  const overs = legalBalls / 6

  return {
    playerId: bowlerId,
    overs: formatOvers(legalBalls),
    runs,
    wickets,
    economy: overs > 0 ? Math.round((runs / overs) * 100) / 100 : 0,
  }
}
