import { useRef, useEffect, useCallback } from 'react'

interface TouchGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinchZoom?: (scale: number) => void
  onDoubleTap?: () => void
  threshold?: number
  preventScroll?: boolean
  enabled?: boolean
}

export function useTouchGestures(
  elementRef: React.RefObject<HTMLElement>,
  options: TouchGestureOptions
) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinchZoom,
    onDoubleTap,
    threshold = 50,
    preventScroll = false,
    enabled = true,
  } = options

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const lastTapRef = useRef<number>(0)
  const initialDistanceRef = useRef<number>(0)
  const initialScaleRef = useRef<number>(1)

  const getDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return

      if (e.touches.length === 1) {
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          time: Date.now(),
        }

        // Double tap detection
        const now = Date.now()
        if (now - lastTapRef.current < 300) {
          e.preventDefault()
          onDoubleTap?.()
          lastTapRef.current = 0
        } else {
          lastTapRef.current = now
        }
      } else if (e.touches.length === 2 && onPinchZoom) {
        initialDistanceRef.current = getDistance(e.touches)
        initialScaleRef.current = 1
      }
    },
    [enabled, onDoubleTap, onPinchZoom]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return

      if (e.touches.length === 2 && onPinchZoom) {
        e.preventDefault()
        const distance = getDistance(e.touches)
        if (initialDistanceRef.current > 0) {
          const scale = distance / initialDistanceRef.current
          onPinchZoom(scale)
        }
      } else if (e.touches.length === 1 && preventScroll) {
        e.preventDefault()
      }
    },
    [enabled, onPinchZoom, preventScroll]
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !touchStartRef.current) return

      const touchEnd = e.changedTouches[0]
      const deltaX = touchEnd.clientX - touchStartRef.current.x
      const deltaY = touchEnd.clientY - touchStartRef.current.y
      const deltaTime = Date.now() - touchStartRef.current.time

      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      // Check if it's a swipe (not a tap)
      if (deltaTime < 300 && (absX > threshold || absY > threshold)) {
        if (absX > absY) {
          if (deltaX > 0) {
            onSwipeRight?.()
          } else {
            onSwipeLeft?.()
          }
        } else {
          if (deltaY > 0) {
            onSwipeDown?.()
          } else {
            onSwipeUp?.()
          }
        }
      }

      touchStartRef.current = null
    },
    [enabled, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]
  )

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll })
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd, preventScroll])
}

export function useSwipeNavigation(
  elementRef: React.RefObject<HTMLElement>,
  onNext: () => void,
  onPrevious: () => void,
  options: { enabled?: boolean; threshold?: number } = {}
) {
  const { enabled = true, threshold = 50 } = options

  useTouchGestures(elementRef, {
    onSwipeLeft: onNext,
    onSwipeRight: onPrevious,
    threshold,
    enabled,
    preventScroll: false,
  })
}