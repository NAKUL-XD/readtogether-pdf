import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui'
import { useReaderStore, useRoomStore, useUIStore } from '@/store'
import { cn } from '@/utils'
import { sidebarAnimation } from '@/animations'
import { ThumbnailSidebar } from '../reader/ThumbnailSidebar'
import { ChatSidebar } from '../chat/ChatSidebar'
import { ParticipantsSidebar } from '../participants/ParticipantsSidebar'
import { BookmarksSidebar } from '../bookmarks/BookmarksSidebar'
import { SettingsSidebar } from '../settings/SettingsSidebar'

export function Sidebar() {
  const { isSidebarOpen, toggleSidebar, isChatOpen, isParticipantsOpen, isBookmarksOpen, isSettingsOpen, setChatOpen, setParticipantsOpen, setBookmarksOpen, setSettingsOpen } = useUIStore()
  const { room } = useRoomStore()

  if (!isSidebarOpen && !isChatOpen && !isParticipantsOpen && !isBookmarksOpen && !isSettingsOpen) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.aside
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={sidebarAnimation}
        className={cn(
          'sidebar left-0 top-16 h-[calc(100vh-4rem)] w-80 lg:w-72',
          'flex flex-col overflow-hidden'
        )}
        role="complementary"
        aria-label="Sidebar"
      >
        <div className="flex items-center justify-between p-4 border-b border-charcoal-200/50 dark:border-charcoal-700/50">
          <h2 className="font-medium text-charcoal-900 dark:text-charcoal-100">
            {isChatOpen ? 'Chat' : isParticipantsOpen ? 'Participants' : isBookmarksOpen ? 'Bookmarks' : isSettingsOpen ? 'Settings' : 'Thumbnails'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (isChatOpen) setChatOpen(false)
              else if (isParticipantsOpen) setParticipantsOpen(false)
              else if (isBookmarksOpen) setBookmarksOpen(false)
              else if (isSettingsOpen) setSettingsOpen(false)
              else toggleSidebar()
            }}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isChatOpen && <ChatSidebar onClose={() => setChatOpen(false)} />}
          {isParticipantsOpen && <ParticipantsSidebar onClose={() => setParticipantsOpen(false)} />}
          {isBookmarksOpen && <BookmarksSidebar onClose={() => setBookmarksOpen(false)} />}
          {isSettingsOpen && <SettingsSidebar onClose={() => setSettingsOpen(false)} />}
          {!isChatOpen && !isParticipantsOpen && !isBookmarksOpen && !isSettingsOpen && <ThumbnailSidebar fileUrl={room?.book?.fileUrl || ''} />}
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}