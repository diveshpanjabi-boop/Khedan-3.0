'use client'

const SPORTS = ['All', 'Cricket', 'Football', 'Badminton', 'Basketball', 'Volleyball']
const PRICE_RANGES = [
  { label: 'Any price', max: Infinity },
  { label: 'Under ₹300/hr', max: 300 },
  { label: 'Under ₹500/hr', max: 500 },
  { label: 'Under ₹1000/hr', max: 1000 },
]

interface Props {
  selectedSport: string
  selectedMaxPrice: number
  onSportChange: (sport: string) => void
  onPriceChange: (max: number) => void
}

export function VenueFilters({ selectedSport, selectedMaxPrice, onSportChange, onPriceChange }: Props) {
  return (
    <div className="space-y-2 px-4 py-3 bg-white border-b border-gray-100">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SPORTS.map(sport => (
          <button
            key={sport}
            onClick={() => onSportChange(sport)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              selectedSport === sport
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {sport}
          </button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {PRICE_RANGES.map(range => (
          <button
            key={range.label}
            onClick={() => onPriceChange(range.max)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              selectedMaxPrice === range.max
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  )
}
