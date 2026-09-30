import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

export function useBreakpoints() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isLargeDesktop = useMediaQuery('(min-width: 1280px)')
  const isTouch = useMediaQuery('(hover: none) and (pointer: coarse)')
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isTouch,
    prefersReducedMotion,
    prefersDark,
  }
}