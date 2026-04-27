'use client'
import { useState } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'
import { useCity } from '@/lib/hooks/useCity'

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Kolkata', 'Ahmedabad']

export function CityPicker() {
  const { city, setCity } = useCity()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
        <MapPin className="w-4 h-4 text-green-600" />
        {city || 'Pick city'}
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-50 min-w-36">
          {CITIES.map(c => (
            <button key={c} onClick={() => { setCity(c); setOpen(false) }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl ${city === c ? 'text-green-600 font-medium' : 'text-gray-700'}`}>{c}</button>
          ))}
        </div>
      )}
    </div>
  )
}
