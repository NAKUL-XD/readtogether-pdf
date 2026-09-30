import { useRef, useEffect, useCallback, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { motion } from 'framer-motion'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui'
import { useReaderStore } from '@/store'
import { cn } from '@/utils'
import { AnnotationLayer } from './AnnotationLayer'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

interface PDFViewerProps {
  fileUrl: string
  onPageChange: (page: number) => void
  onLoadComplete: (totalPages: number) => void
  onLoadError: (error: Error) => void
  onLoadProgress: (progress: number) => void
}

export function PDFViewer({ fileUrl, onPageChange, onLoadComplete, onLoadError, onLoadProgress }: PDFViewerProps) {
  const {
    currentPage,
    zoom,
    rotation,
    readingMode,
    isLoading,
    loadingProgress,
  } = useReaderStore()

  const [numPages, setNumPages] = useState(0)
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  // one ref per page so we can scroll to it
  const pageRefs = useRef<(HTMLDivElement | null)[]>([])
  // prevent scroll-observer from fighting with programmatic scrolls
  const isScrollingProgrammatically = useRef(false)

  const handleDocumentLoad = useCallback((pdf: any) => {
    setNumPages(pdf.numPages)
    onLoadComplete(pdf.numPages)
  }, [onLoadComplete])

  const handleLoadError = useCallback((err: Error) => {
    onLoadError(err)
  }, [onLoadError])

  // When currentPage changes from OUTSIDE (i.e. socket sync), scroll to that page
  useEffect(() => {
    if (!numPages || currentPage < 1) return
    const el = pageRefs.current[currentPage - 1]
    if (!el) return
    isScrollingProgrammatically.current = true
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // release the lock after the animation finishes (~600 ms)
    setTimeout(() => { isScrollingProgrammatically.current = false }, 700)
  }, [currentPage, numPages])

  // IntersectionObserver: detect which page is most visible and report it
  useEffect(() => {
    if (!numPages) return
    const container = containerRef.current
    if (!container) return

    const observers: IntersectionObserver[] = []

    pageRefs.current.forEach((el, idx) => {
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            if (!isScrollingProgrammatically.current) {
              const newPage = idx + 1
              // tell parent so it can sync with socket
              onPageChange(newPage)
            }
          }
        },
        { root: container, threshold: 0.5 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [numPages, onPageChange])

  return (
    <div
      ref={containerRef}
      className={cn(
        'w-full h-full overflow-y-auto overflow-x-hidden',
        'bg-charcoal-100 dark:bg-charcoal-950',
        'transition-colors duration-300',
        readingMode === 'dark' && 'dark',
        readingMode === 'sepia' && 'sepia'
      )}
      role="region"
      aria-label="PDF Reader"
    >
      <Document
        file={fileUrl}
        onLoadSuccess={handleDocumentLoad}
        onLoadError={handleLoadError}
        loading={<PDFLoading progress={loadingProgress} />}
        error={<PDFError onRetry={() => window.location.reload()} />}
      >
        <div className="flex flex-col items-center py-6 gap-4">
          {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
            <div
              key={pageNum}
              ref={(el) => { pageRefs.current[pageNum - 1] = el }}
              id={`pdf-page-${pageNum}`}
              className="relative shadow-xl"
            >
              <Page
                pageNumber={pageNum}
                scale={zoom}
                rotation={rotation}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="block"
                onRenderSuccess={(page) => {
                  const viewport = page.getViewport({ scale: zoom, rotation })
                  setPageDimensions((prev) => {
                    const newDims = [...prev]
                    newDims[pageNum - 1] = { width: viewport.width, height: viewport.height }
                    return newDims
                  })
                }}
              />
              {/* Annotation layer */}
              {pageDimensions[pageNum - 1] && (
                <AnnotationLayer
                  pageNumber={pageNum}
                  pageWidth={pageDimensions[pageNum - 1].width}
                  pageHeight={pageDimensions[pageNum - 1].height}
                />
              )}
              {/* page number badge */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-charcoal-900/60 text-white text-xs font-medium backdrop-blur-sm select-none pointer-events-none z-20">
                {pageNum} / {numPages}
              </div>
            </div>
          ))}
        </div>
      </Document>

      {isLoading && (
        <div className="fixed inset-0 bg-white/90 dark:bg-charcoal-900/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <PDFLoading progress={loadingProgress} />
        </div>
      )}
    </div>
  )
}

function PDFLoading({ progress }: { progress: number }) {
  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, ease: 'linear', repeat: Infinity }}
        className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600"
      />
      <div className="text-center">
        <p className="font-medium text-charcoal-900 dark:text-charcoal-100">Loading PDF…</p>
        <p className="text-sm text-charcoal-500 mt-1">
          {progress > 0 ? `${Math.round(progress)}%` : 'Please wait'}
        </p>
        <div className="w-48 h-2 bg-charcoal-200 dark:bg-charcoal-700 rounded-full overflow-hidden mt-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary-600 rounded-full"
          />
        </div>
      </div>
    </div>
  )
}

function PDFError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-charcoal-900 dark:text-charcoal-100 mb-2">
        Couldn't display this PDF
      </h3>
      <p className="text-charcoal-500 dark:text-charcoal-400 mb-6 max-w-md">
        Something went wrong. Please try again or check if the file is valid.
      </p>
      <Button onClick={onRetry} variant="primary">
        <RotateCcw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    </div>
  )
}
