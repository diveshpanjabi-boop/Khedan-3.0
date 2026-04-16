export type UserRole = 'user' | 'admin'
export type GameRequestStatus = 'open' | 'full' | 'cancelled'
export type JoinRequestStatus = 'pending' | 'accepted' | 'rejected'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'
export type MatchStatus = 'upcoming' | 'live' | 'completed'
export type ExtraType = 'wide' | 'noball' | 'bye' | 'legbye'
export type WicketType = 'bowled' | 'caught' | 'runout' | 'stumped' | 'lbw' | 'hitwicket'
export type PlayerRole = 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper'

export interface User {
  id: string
  name: string
  phone: string | null
  email: string | null
  avatar_url: string | null
  city: string
  role: UserRole
  is_banned: boolean
  created_at: string
}

export interface GameRequest {
  id: string
  author_id: string
  city: string
  venue_id: string | null
  venue_name: string
  sport: string
  datetime: string
  total_spots: number
  filled_spots: number
  description: string | null
  status: GameRequestStatus
  created_at: string
  author?: User
}

export interface JoinRequest {
  id: string
  game_request_id: string
  user_id: string
  status: JoinRequestStatus
  created_at: string
  user?: User
}

export interface ForumPost {
  id: string
  author_id: string
  city: string
  category: string
  title: string
  content: string
  is_pinned: boolean
  likes: string[]
  created_at: string
  updated_at: string
  comments_count?: number
  author?: User
}

export interface ForumComment {
  id: string
  post_id: string
  author_id: string
  content: string
  likes: string[]
  created_at: string
  author?: User
}

export interface Venue {
  id: string
  owner_id: string
  name: string
  city: string
  address: string
  lat: number | null
  lng: number | null
  sports: string[]
  amenities: string[]
  price_per_hour: number
  images: string[]
  contact_phone: string | null
  contact_email: string | null
  opening_time: string
  closing_time: string
  rating: number
  total_ratings: number
  is_active: boolean
  created_at: string
  distance_km?: number
}

export interface Booking {
  id: string
  venue_id: string
  user_id: string
  date: string
  start_time: string
  end_time: string
  sport: string
  total_price: number
  status: BookingStatus
  notes: string | null
  created_at: string
  venue?: Venue
}

export interface Team {
  id: string
  name: string
  color: string
  city: string
  creator_id: string
  created_at: string
}

export interface Player {
  id: string
  team_id: string
  user_id: string | null
  name: string
  role: PlayerRole
}

export interface Match {
  id: string
  tournament_id: string | null
  team1_id: string
  team2_id: string
  venue_id: string | null
  city: string
  overs: number
  status: MatchStatus
  toss_winner_id: string | null
  toss_decision: string | null
  result: string | null
  created_at: string
  team1?: Team
  team2?: Team
}

export interface Ball {
  id: string
  match_id: string
  innings: number
  over_num: number
  ball_num: number
  batsman_id: string
  bowler_id: string
  runs: number
  extras: number
  extra_type: ExtraType | null
  wicket_type: WicketType | null
  dismissed_player_id: string | null
  created_at: string
}

export interface Report {
  id: string
  reporter_id: string
  target_type: 'post' | 'comment' | 'user'
  target_id: string
  reason: string
  status: 'pending' | 'resolved' | 'dismissed'
  created_at: string
}
