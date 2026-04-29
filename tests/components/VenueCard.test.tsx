import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VenueCard } from '@/components/venues/VenueCard'
import type { Venue } from '@/lib/types'

const venue: Venue = {
  id: 'v1',
  owner_id: 'u1',
  name: 'Shivaji Park Ground',
  city: 'Mumbai',
  address: 'Shivaji Park, Dadar',
  lat: 19.0228,
  lng: 72.8371,
  sports: ['Cricket', 'Football'],
  amenities: ['Parking', 'Changing Rooms'],
  price_per_hour: 400,
  images: [],
  contact_phone: null,
  contact_email: null,
  opening_time: '06:00',
  closing_time: '22:00',
  rating: 4.5,
  total_ratings: 28,
  is_active: true,
  created_at: '',
  distance_km: 2.3,
}

describe('VenueCard', () => {
  it('renders venue name', () => {
    render(<VenueCard venue={venue} onBook={vi.fn()} onView={vi.fn()} />)
    expect(screen.getByText('Shivaji Park Ground')).toBeTruthy()
  })

  it('shows distance when available', () => {
    render(<VenueCard venue={venue} onBook={vi.fn()} onView={vi.fn()} />)
    expect(screen.getByText(/2\.3 km/)).toBeTruthy()
  })

  it('shows price per hour', () => {
    render(<VenueCard venue={venue} onBook={vi.fn()} onView={vi.fn()} />)
    expect(screen.getByText(/₹400/)).toBeTruthy()
  })

  it('shows sport tags', () => {
    render(<VenueCard venue={venue} onBook={vi.fn()} onView={vi.fn()} />)
    expect(screen.getByText('Cricket')).toBeTruthy()
    expect(screen.getByText('Football')).toBeTruthy()
  })

  it('calls onBook when Book Now clicked', async () => {
    const onBook = vi.fn()
    render(<VenueCard venue={venue} onBook={onBook} onView={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /book now/i }))
    expect(onBook).toHaveBeenCalledWith('v1')
  })
})
