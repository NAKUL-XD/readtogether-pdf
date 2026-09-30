import { Crown, UserX } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { Avatar } from '@/components/ui'
import { useRoomStore } from '@/store'
import { cn } from '@/utils'
import type { Participant } from '@/types'

interface ParticipantsSidebarProps {
  onClose: () => void
}

export function ParticipantsSidebar({ onClose }: ParticipantsSidebarProps) {
  const { participants, currentUser, room } = useRoomStore()
  const controlMode = room?.controlMode

  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.isHost && !b.isHost) return -1
    if (!a.isHost && b.isHost) return 1
    if (a.isOnline && !b.isOnline) return -1
    if (!a.isOnline && b.isOnline) return 1
    return a.displayName.localeCompare(b.displayName)
  })

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-charcoal-900 dark:text-charcoal-100">
          Participants ({participants.length})
        </h3>
        {controlMode === 'shared' && (
          <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
            Shared control
          </span>
        )}
        {controlMode === 'host' && currentUser?.isHost && (
          <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
            Host control
          </span>
        )}
      </div>

      <ul className="space-y-2" role="list" aria-label="Participants">
        {sortedParticipants.map((participant) => (
          <ParticipantItem
            key={participant.userId}
            participant={participant}
            isCurrentUser={participant.userId === currentUser?.userId}
            isHost={currentUser?.isHost ?? false}
          />
        ))}
      </ul>

      {currentUser?.isHost && (
        <div className="pt-4 border-t border-charcoal-200/50 dark:border-charcoal-700/50">
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mb-2">
            As host, you can remove participants or change control mode in settings.
          </p>
        </div>
      )}
    </div>
  )
}

interface ParticipantItemProps {
  participant: Participant
  isCurrentUser: boolean
  isHost: boolean
}

function ParticipantItem({ participant, isCurrentUser, isHost }: ParticipantItemProps) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-2 rounded-xl hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
    >
      <Avatar
        name={participant.displayName}
        src={participant.avatar}
        size="md"
        status={participant.isOnline ? 'online' : 'offline'}
        userId={participant.userId}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            'font-medium truncate',
            isCurrentUser ? 'text-primary-600 dark:text-primary-400' : 'text-charcoal-900 dark:text-charcoal-100'
          )}>
            {participant.displayName} {isCurrentUser && '(You)'}
          </p>
          {participant.isHost && (
            <Crown className="w-4 h-4 text-amber-500" aria-label="Host" />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-charcoal-500 dark:text-charcoal-400">
          <span className={cn('flex items-center gap-1', participant.isOnline ? 'text-green-600 dark:text-green-400' : '')}>
            {participant.isOnline ? (
              <>
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" aria-hidden="true" />
                Online · Page {participant.currentPage}
              </>
            ) : (
              'Offline'
            )}
          </span>
        </div>
      </div>
      {isHost && !isCurrentUser && !participant.isHost && (
        <Button
          variant="ghost"
          size="icon"
          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          aria-label={`Remove ${participant.displayName}`}
        >
          <UserX className="w-4 h-4" aria-hidden="true" />
        </Button>
      )}
    </motion.li>
  )
}