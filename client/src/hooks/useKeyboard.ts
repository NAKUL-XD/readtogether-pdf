import { useEffect, useCallback } from 'react'

export function useKeyboard(
  keyMap: Record<string, () => void>,
  deps: React.DependencyList = []
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const handler = keyMap[event.key]
      if (handler) {
        event.preventDefault()
        handler()
      }
    },
    [keyMap]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, ...deps])
}

export function useEscapeKey(onEscape: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onEscape, enabled])
}

export function useArrowKeys(
  onLeft?: () => void,
  onRight?: () => void,
  onUp?: () => void,
  onDown?: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          onLeft?.()
          break
        case 'ArrowRight':
          event.preventDefault()
          onRight?.()
          break
        case 'ArrowUp':
          event.preventDefault()
          onUp?.()
          break
        case 'ArrowDown':
          event.preventDefault()
          onDown?.()
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onLeft, onRight, onUp, onDown, enabled])
}

export function useSpaceKey(onSpace: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ' && !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) {
        event.preventDefault()
        onSpace()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSpace, enabled])
}

export function useFullscreenKey(onFullscreen: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'f' || event.key === 'F') {
        if (!['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) {
          event.preventDefault()
          onFullscreen()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onFullscreen, enabled])
}