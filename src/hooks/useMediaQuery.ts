'use client'

import { useEffect, useState } from 'react'
import { BREAKPOINTS } from '@/lib/constants'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMatches(media.matches)

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

export function useBreakpoint() {
  const isXs = useMediaQuery(`(min-width: ${BREAKPOINTS.XS}px)`)
  const isSm = useMediaQuery(`(min-width: ${BREAKPOINTS.SM}px)`)
  const isMd = useMediaQuery(`(min-width: ${BREAKPOINTS.MD}px)`)
  const isLg = useMediaQuery(`(min-width: ${BREAKPOINTS.LG}px)`)
  const isXl = useMediaQuery(`(min-width: ${BREAKPOINTS.XL}px)`)
  const is2Xl = useMediaQuery(`(min-width: ${BREAKPOINTS.XXL}px)`)

  return { isXs, isSm, isMd, isLg, isXl, is2Xl }
}
