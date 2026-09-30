import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import { BookOpen, Users, ArrowRight, MousePointer, Monitor, Smartphone, Tablet } from 'lucide-react'
import { staggerContainer, staggerItem, float, pulse } from '@/animations'
import { cn } from '@/utils'

export function LandingPage() {
  const navigate = useNavigate()

  const handleCreateRoom = () => navigate('/create')
  const handleJoinRoom = () => navigate('/join')

  return (
    <div className="min-h-screen bg-gradient-to-b from-paper-light to-charcoal-50 dark:from-charcoal-900 dark:to-charcoal-950">
      <nav className="fixed top-0 left-0 right-0 z-30 bg-white/80 dark:bg-charcoal-900/80 backdrop-blur-xl border-b border-charcoal-200/50 dark:border-charcoal-700/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            <span className="font-serif text-2xl font-medium text-charcoal-900 dark:text-charcoal-100">ReadTogether</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={handleJoinRoom}>Join a Room</Button>
            <Button variant="primary" onClick={handleCreateRoom}>Create Reading Room</Button>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-20 px-6">
        <section className="max-w-7xl mx-auto" aria-labelledby="hero-heading">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center py-20 lg:py-32"
          >
            <motion.h1
              id="hero-heading"
              variants={staggerItem}
              className="font-serif text-5xl lg:text-7xl font-medium text-charcoal-900 dark:text-charcoal-100 tracking-tight text-balance"
            >
              READ TOGETHER
            </motion.h1>
            <motion.p
              variants={staggerItem}
              className="mt-6 text-lg lg:text-xl text-charcoal-600 dark:text-charcoal-300 max-w-2xl mx-auto text-balance"
            >
              "Read the same story, together."
            </motion.p>
            <motion.p
              variants={staggerItem}
              className="mt-4 text-base lg:text-lg text-charcoal-500 dark:text-charcoal-400 max-w-xl mx-auto"
            >
              Upload a book, invite a friend, and turn every page together in real time.
            </motion.p>
            <motion.div
              variants={staggerItem}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button size="lg" onClick={handleCreateRoom} className="w-full sm:w-auto min-w-[200px]">
                Create Reading Room
                <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
              </Button>
              <Button variant="secondary" size="lg" onClick={handleJoinRoom} className="w-full sm:w-auto min-w-[200px]">
                Join a Room
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
            className="relative mt-20 lg:mt-32"
          >
            <InteractivePreview />
          </motion.div>
        </section>

        <section className="max-w-7xl mx-auto mt-28 lg:mt-40" aria-labelledby="features-heading">
          <motion.h2
            id="features-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-3xl lg:text-4xl font-medium text-charcoal-900 dark:text-charcoal-100 text-center mb-16"
          >
            Built for Reading Together
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-elevated p-6 lg:p-8 hover:shadow-page-hover transition-shadow duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                </div>
                <h3 className="font-medium text-lg text-charcoal-900 dark:text-charcoal-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-charcoal-500 dark:text-charcoal-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto mt-28 lg:mt-40" aria-labelledby="devices-heading">
          <motion.h2
            id="devices-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-3xl lg:text-4xl font-medium text-charcoal-900 dark:text-charcoal-100 text-center mb-16"
          >
            Works on Every Device
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {devices.map((device, index) => (
              <motion.div
                key={device.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-charcoal-100 dark:bg-charcoal-800"
              >
                <device.icon className="absolute top-4 right-4 w-10 h-10 text-charcoal-300 dark:text-charcoal-600" aria-hidden="true" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="font-medium text-white drop-shadow-lg">{device.name}</p>
                  <p className="text-white/80 text-sm mt-1 drop-shadow">{device.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-charcoal-200/50 dark:border-charcoal-700/50 px-6 py-12">
        <div className="max-w-7xl mx-auto text-center text-charcoal-500 dark:text-charcoal-400 text-sm">
          <p>ReadTogether — Read the same story, together.</p>
        </div>
      </footer>
    </div>
  )
}

function InteractivePreview() {
  const [page, setPage] = React.useState(24)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPage((p) => (p >= 287 ? 24 : p + 1))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/10 via-transparent to-primary-500/10 rounded-2xl blur-2xl animate-pulse" aria-hidden="true" />
      
      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6">
        {['Reader A', 'Reader B'].map((reader, i) => (
          <motion.div
            key={reader}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="relative"
          >
            <div className="aspect-[3/4] bg-white dark:bg-charcoal-900 rounded-xl shadow-page border border-charcoal-200/50 dark:border-charcoal-700/50 overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-charcoal-200 dark:text-charcoal-700" aria-hidden="true" />
                  <p className="font-medium text-charcoal-900 dark:text-charcoal-100">The Great Gatsby</p>
                  <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">by F. Scott Fitzgerald</p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
                    <span className="text-sm font-medium">{reader}</span>
                  </div>
                  <motion.div
                    key={page}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-mono"
                  >
                    Page {page} / 287
                  </motion.div>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-charcoal-500 dark:text-charcoal-400 mt-3">{reader}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        key={page}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-900 px-6 py-3 rounded-full text-sm font-medium shadow-elevated"
        aria-live="polite"
      >
        Both readers turned to page {page}
      </motion.div>
    </div>
  )
}

import React from 'react'

const features = [
  {
    title: 'Real-time Sync',
    description: 'Page changes sync instantly between readers with smooth animations.',
    icon: Users,
  },
  {
    title: 'Any Device',
    description: 'Works beautifully on phones, tablets, and desktops with touch gestures.',
    icon: Monitor,
  },
  {
    title: 'Private Rooms',
    description: 'Create secure reading rooms with shareable links — no account required.',
    icon: BookOpen,
  },
]

const devices = [
  {
    name: 'Mobile',
    description: 'Swipe to turn pages, pinch to zoom',
    icon: Smartphone,
  },
  {
    name: 'Tablet',
    description: 'Optimized for portrait & landscape reading',
    icon: Tablet,
  },
  {
    name: 'Desktop',
    description: 'Keyboard shortcuts, sidebar thumbnails, fullscreen',
    icon: Monitor,
  },
]