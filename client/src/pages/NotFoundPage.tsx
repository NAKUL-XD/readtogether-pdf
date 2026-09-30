import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { BookOpen, Home, RotateCcw } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-paper-light dark:bg-charcoal-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="w-20 h-20 mx-auto mb-6 bg-charcoal-100 dark:bg-charcoal-800 rounded-full flex items-center justify-center"
        >
          <BookOpen className="w-10 h-10 text-charcoal-400 dark:text-charcoal-500" aria-hidden="true" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-serif text-5xl font-medium text-charcoal-900 dark:text-charcoal-100 mb-4"
        >
          404
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-charcoal-500 dark:text-charcoal-400 mb-8 max-w-md mx-auto"
        >
          This page doesn't exist or has been moved. Let's get you back to reading.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button size="lg" asChild>
            <Link to="/">
              <Home className="w-5 h-5 mr-2" aria-hidden="true" />
              Go Home
            </Link>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/create">
              <RotateCcw className="w-5 h-5 mr-2" aria-hidden="true" />
              Create Room
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}