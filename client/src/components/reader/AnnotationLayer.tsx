import { useEffect, useRef, useState } from 'react'
import { useRoomStore, useAnnotationStore } from '@/store'
import { socketService } from '@/services'
import type { Point, Annotation } from '@/types'
import { generateId } from '@/utils'

interface AnnotationLayerProps {
  pageNumber: number
  pageWidth: number
  pageHeight: number
}

export function AnnotationLayer({ pageNumber, pageWidth, pageHeight }: AnnotationLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentPoints, setCurrentPoints] = useState<Point[]>([])
  const isDrawingRef = useRef(false)

  const { annotations } = useRoomStore()
  const {
    isEnabled,
    currentTool,
    currentColor,
    strokeWidth,
    setIsDrawing,
  } = useAnnotationStore()

  // Filter annotations for current page
  const pageAnnotations = annotations.filter((a) => a.pageNumber === pageNumber)

  // Redraw canvas when annotations or page changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw all annotations for this page
    pageAnnotations.forEach((annotation) => {
      drawAnnotation(ctx, annotation)
    })

    // Draw current stroke in progress
    if (currentPoints.length > 0 && currentTool && currentTool !== 'eraser') {
      drawStroke(ctx, currentPoints, currentColor, strokeWidth, currentTool)
    }
  }, [pageAnnotations, currentPoints, currentColor, strokeWidth, currentTool])

  const drawAnnotation = (ctx: CanvasRenderingContext2D, annotation: Annotation) => {
    if (annotation.points.length < 2) return
    drawStroke(ctx, annotation.points, annotation.color, annotation.strokeWidth, annotation.type)
  }

  const drawStroke = (
    ctx: CanvasRenderingContext2D,
    points: Point[],
    color: string,
    width: number,
    type: 'draw' | 'highlight'
  ) => {
    if (points.length < 2) return

    ctx.save()
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (type === 'highlight') {
      ctx.globalAlpha = 0.3
      ctx.lineWidth = width * 3 // Highlights are thicker
    }

    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    ctx.stroke()
    ctx.restore()
  }

  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    let clientX: number, clientY: number

    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEnabled || !currentTool) return
    
    e.preventDefault()
    e.stopPropagation()

    if (currentTool === 'eraser') {
      handleEraser(e)
      return
    }

    isDrawingRef.current = true
    setIsDrawing(true)

    const point = getCanvasPoint(e)
    setCurrentPoints([point])
  }

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current || !currentTool || currentTool === 'eraser') return

    e.preventDefault()
    e.stopPropagation()

    const point = getCanvasPoint(e)
    setCurrentPoints((prev) => [...prev, point])
  }

  const handlePointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current || !currentTool || currentTool === 'eraser') return

    e.preventDefault()
    e.stopPropagation()

    isDrawingRef.current = false
    setIsDrawing(false)

    if (currentPoints.length < 2) {
      setCurrentPoints([])
      return
    }

    // Send annotation to server
    socketService.addAnnotation(
      pageNumber,
      currentTool as 'draw' | 'highlight',
      currentPoints,
      currentColor,
      currentTool === 'highlight' ? strokeWidth * 3 : strokeWidth
    )

    setCurrentPoints([])
  }

  const handleEraser = (e: React.MouseEvent | React.TouchEvent) => {
    const point = getCanvasPoint(e)
    const eraserRadius = 10

    // Find annotations near click point and delete them
    const toDelete = pageAnnotations.filter((annotation) => {
      return annotation.points.some((p) => {
        const dist = Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2))
        return dist < eraserRadius
      })
    })

    toDelete.forEach((annotation) => {
      socketService.deleteAnnotation(annotation.id)
    })
  }

  if (!isEnabled) return null

  return (
    <canvas
      ref={canvasRef}
      width={pageWidth}
      height={pageHeight}
      className="absolute inset-0 touch-none z-10"
      style={{
        cursor: currentTool === 'eraser' ? 'crosshair' : currentTool ? 'crosshair' : 'default',
        pointerEvents: isEnabled ? 'auto' : 'none',
      }}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    />
  )
}
