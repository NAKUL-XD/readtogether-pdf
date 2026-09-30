import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Document, Page } from 'react-pdf'
import { Button } from '@/components/ui'
import { useReaderStore, useRoomStore } from '@/store'
import { cn } from '@/utils'
import { pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`

interface ThumbnailSidebarProps {
  fileUrl: string
}

export function ThumbnailSidebar({ fileUrl }: ThumbnailSidebarProps) {
  const { currentPage, showThumbnails, zoom } = useReaderStore()
  const { setCurrentPage } = useReaderStore()
  const { totalPages } = useRoomStore()

  if (!showThumbnails || totalPages === 0) return null

  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1), [totalPages])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-charcoal-900 dark:text-charcoal-100">Thumbnails</h3>
        <span className="text-sm text-charcoal-500 dark:text-charcoal-400">{totalPages} pages</span>
      </div>

      <AnimatePresence>
        {pageNumbers.map((pageNum) => (
          <motion.button
            key={pageNum}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            onClick={() => setCurrentPage(pageNum)}
            className={cn(
              'relative w-full aspect-[3/4] bg-white dark:bg-charcoal-800 rounded-lg overflow-hidden border transition-all duration-200',
              'hover:shadow-md hover:border-primary-500/50',
              currentPage === pageNum
                ? 'ring-2 ring-primary-500 border-primary-500 shadow-md'
                : 'border-charcoal-200 dark:border-charcoal-700'
            )}
            aria-label={`Go to page ${pageNum}`}
            aria-current={currentPage === pageNum ? 'page' : undefined}
          >
            <Document file={fileUrl}>
              <Page
                pageNumber={pageNum}
                scale={0.3}
                renderTextMode="none"
                className="w-full h-full object-cover"
              />
            </Document>
            {currentPage === pageNum && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                {pageNum}
              </div>
            )}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}