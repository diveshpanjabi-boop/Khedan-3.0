'use client'

import { useState, useEffect } from 'react'

const CITY_KEY = 'khedan_city'

export function useCity() {
  const [city, setCity] = useState<string>('')

  useEffect(() => {
    const stored = localStorage.getItem(CITY_KEY)
    if (stored) setCity(stored)
  }, [])

  function selectCity(newCity: string) {
    localStorage.setItem(CITY_KEY, newCity)
    setCity(newCity)
  }

  return { city, selectCity, setCity: selectCity }
}
