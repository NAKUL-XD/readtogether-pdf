import { BookOpen, Users, Settings, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui'
import { useRoomStore, useUIStore } from '@/store'
import { cn } from '@/utils'

interface HeaderProps {
  title: string
  onBack?: () => void
  showBack?: boolean
}

export function Header({ title, onBack, showBack = false }: HeaderProps) {
  const { participants } = useRoomStore()
  const { toggleSettings, toggleParticipants, isSettingsOpen, isParticipantsOpen } = useUIStore()
  const onlineCount = participants.filter((p) => p.isOnline).length

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white/80 dark:bg-charcoal-900/80 backdrop-blur-xl border-b border-charcoal-200/50 dark:border-charcoal-700/50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {showBack && onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="lg:hidden"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            <h1 className="font-serif text-xl font-medium text-charcoal-900 dark:text-charcoal-100 truncate">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-charcoal-100 dark:bg-charcoal-800">
            <Users className="w-4 h-4 text-charcoal-500 dark:text-charcoal-400" aria-hidden="true" />
            <span className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">
              {onlineCount} {onlineCount === 1 ? 'reader' : 'readers'}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleParticipants}
            className={cn('rounded-xl', isParticipantsOpen && 'bg-charcoal-100 dark:bg-charcoal-800')}
            aria-label="Participants"
            aria-pressed={isParticipantsOpen}
          >
            <Users className="w-5 h-5" aria-hidden="true" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSettings}
            className={cn('rounded-xl', isSettingsOpen && 'bg-charcoal-100 dark:bg-charcoal-800')}
            aria-label="Settings"
            aria-pressed={isSettingsOpen}
          >
            <Settings className="w-5 h-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  )
}