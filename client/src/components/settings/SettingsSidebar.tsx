import { Users, Trash2, Copy, ExternalLink, Crown } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { Avatar } from '@/components/ui'
import { useRoomStore, useReaderStore, useUserStore, useUIStore } from '@/store'
import { socketService } from '@/services'
import { cn, getShareableUrl, copyToClipboard } from '@/utils'
import type { ReadingMode, ControlMode } from '@/types'

interface SettingsSidebarProps {
  onClose: () => void
}

export function SettingsSidebar({ onClose }: SettingsSidebarProps) {
  const { room, updateSettings, setControlMode, setReadingMode, currentUser } = useRoomStore()
  const { readingMode, setReadingMode: setReaderReadingMode, zoom, resetZoom } = useReaderStore()
  const { user, updateDisplayName } = useUserStore()
  const { addToast } = useUIStore()

  const handleReadingModeChange = (mode: ReadingMode) => {
    setReaderReadingMode(mode)
    setReadingMode(mode)
    if (room) {
      socketService.updateSettings({ readingMode: mode })
    }
  }

  const handleControlModeChange = (mode: ControlMode) => {
    setControlMode(mode)
    if (room) {
      socketService.updateSettings({ controlMode: mode })
    }
  }

  const handleCopyInvite = async () => {
    if (!room) return
    try {
      await copyToClipboard(getShareableUrl(room.roomCode))
      addToast({ type: 'success', title: 'Invite link copied!' })
    } catch {
      addToast({ type: 'error', title: 'Failed to copy link' })
    }
  }

  const handleLeaveRoom = () => {
    if (room && user) {
      socketService.leaveRoom()
      useRoomStore.getState().clearRoom()
      useReaderStore.getState().reset()
      onClose()
    }
  }

  const handleEndRoom = () => {
    addToast({ type: 'info', title: 'Room ended' })
  }

  if (!room) return null

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      <section>
        <h4 className="text-sm font-medium text-charcoal-500 dark:text-charcoal-400 mb-3 uppercase tracking-wide">
          Reading Experience
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
              Reading Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'dark', 'sepia'] as ReadingMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleReadingModeChange(mode)}
                  className={cn(
                    'p-3 rounded-xl border-2 transition-all duration-200 text-center',
                    readingMode === mode
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-charcoal-200 dark:border-charcoal-700 hover:border-charcoal-300 dark:hover:border-charcoal-600'
                  )}
                  aria-pressed={readingMode === mode}
                >
                  <div className={cn('w-8 h-8 rounded-lg mx-auto mb-1.5', {
                    'bg-white border border-charcoal-200': mode === 'light',
                    'bg-charcoal-900': mode === 'dark',
                    'bg-paper-sepia border border-charcoal-200': mode === 'sepia',
                  })} />
                  <span className="text-xs font-medium capitalize">
                    {mode}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-charcoal-900 dark:text-charcoal-100">Page Animation</p>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Smooth page transitions</p>
            </div>
            <input
              type="checkbox"
              checked={room.settings.pageAnimation}
              onChange={(e) => updateSettings({ pageAnimation: e.target.checked })}
              className="w-5 h-5 text-primary-600 border-charcoal-300 rounded focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-charcoal-900 dark:text-charcoal-100">Sound Effects</p>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Subtle audio feedback</p>
            </div>
            <input
              type="checkbox"
              checked={room.settings.soundEffects}
              onChange={(e) => updateSettings({ soundEffects: e.target.checked })}
              className="w-5 h-5 text-primary-600 border-charcoal-300 rounded focus:ring-primary-500"
            />
          </label>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
              Zoom: {Math.round(zoom * 100)}%
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="50"
                max="300"
                value={Math.round(zoom * 100)}
                onChange={(e) => useReaderStore.getState().setZoom(parseInt(e.target.value) / 100)}
                className="flex-1"
              />
              <Button variant="ghost" size="sm" onClick={resetZoom}>
                Reset
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h4 className="text-sm font-medium text-charcoal-500 dark:text-charcoal-400 mb-3 uppercase tracking-wide">
          Room Control
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
              Control Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['shared', 'host'] as ControlMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleControlModeChange(mode)}
                  className={cn(
                    'p-3 rounded-xl border-2 text-center transition-all duration-200',
                    room.controlMode === mode
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-charcoal-200 dark:border-charcoal-700 hover:border-charcoal-300 dark:hover:border-charcoal-600'
                  )}
                  aria-pressed={room.controlMode === mode}
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {mode === 'shared' ? (
                      <Users className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <Crown className="w-5 h-5" aria-hidden="true" />
                    )}
                    <span className="font-medium capitalize">{mode}</span>
                  </div>
                  <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
                    {mode === 'shared' ? 'Both readers control pages' : 'Only host controls pages'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h4 className="text-sm font-medium text-charcoal-500 dark:text-charcoal-400 mb-3 uppercase tracking-wide">
          Invite Others
        </h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-charcoal-50 dark:bg-charcoal-800/50 rounded-xl">
            <input
              type="text"
              value={getShareableUrl(room.roomCode)}
              readOnly
              className="flex-1 bg-transparent border-none focus:outline-none text-sm text-charcoal-600 dark:text-charcoal-400"
            />
            <Button variant="ghost" size="icon" onClick={handleCopyInvite} aria-label="Copy invite link">
              <Copy className="w-5 h-5" aria-hidden="true" />
            </Button>
          </div>
          <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
            Room code: <span className="font-mono font-medium text-charcoal-900 dark:text-charcoal-100">{room.roomCode}</span>
          </p>
        </div>
      </section>

      <section>
        <h4 className="text-sm font-medium text-charcoal-500 dark:text-charcoal-400 mb-3 uppercase tracking-wide">
          Your Profile
        </h4>
        <div className="flex items-center gap-3 p-3 bg-charcoal-50 dark:bg-charcoal-800/50 rounded-xl">
          <Avatar name={user?.displayName || 'Guest'} src={user?.avatar} size="lg" userId={user?.id} />
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={user?.displayName || ''}
              onChange={(e) => updateDisplayName(e.target.value)}
              className="bg-transparent border-none focus:outline-none font-medium text-charcoal-900 dark:text-charcoal-100"
              aria-label="Your name"
            />
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400">This name is visible to others</p>
          </div>
        </div>
      </section>

      <section>
        <h4 className="text-sm font-medium text-charcoal-500 dark:text-charcoal-400 mb-3 uppercase tracking-wide">
          Danger Zone
        </h4>
        <div className="space-y-2">
          {currentUser?.isHost ? (
            <Button variant="danger" className="w-full justify-start" onClick={handleEndRoom}>
              <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
              End Room for Everyone
            </Button>
          ) : (
            <Button variant="danger" className="w-full justify-start" onClick={handleLeaveRoom}>
              <ExternalLink className="w-4 h-4 mr-2" aria-hidden="true" />
              Leave Room
            </Button>
          )}
        </div>
      </section>
    </div>
  )
}