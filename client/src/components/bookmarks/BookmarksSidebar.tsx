import { useState } from 'react'
import { Bookmark, Plus, Share2, Trash2, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button, Input } from '@/components/ui'
import { useRoomStore, useReaderStore } from '@/store'
import { socketService } from '@/services'
import { formatDate } from '@/utils'
import type { Bookmark as BookmarkType } from '@/types'

interface BookmarksSidebarProps {
  onClose: () => void
}

export function BookmarksSidebar({ onClose }: BookmarksSidebarProps) {
  const { bookmarks, currentUser, room, addBookmark } = useRoomStore()
  const { currentPage } = useReaderStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [label, setLabel] = useState('')
  const [isShared, setIsShared] = useState(false)

  const myBookmarks = bookmarks.filter((b) => b.userId === currentUser?.userId && !b.isShared)
  const sharedBookmarks = bookmarks.filter((b) => b.isShared)

  const handleAddBookmark = () => {
    if (!currentUser || !room) return
    const newBookmark: BookmarkType = {
      id: crypto.randomUUID(),
      roomId: room.id,
      userId: currentUser.userId,
      pageNumber: currentPage,
      label: label.trim() || undefined,
      isShared,
      createdAt: new Date(),
    }
    addBookmark(newBookmark)
    setShowAddForm(false)
    setLabel('')
    setIsShared(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-charcoal-200/50 dark:border-charcoal-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-charcoal-900 dark:text-charcoal-100">Bookmarks</h3>
          <Button variant="secondary" size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
            Add
          </Button>
        </div>

        {showAddForm && (
          <div className="space-y-3 animate-in">
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Bookmark label (optional)"
              aria-label="Bookmark label"
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-charcoal-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-charcoal-700 dark:text-charcoal-300">Share with room</span>
            </label>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleAddBookmark} className="flex-1">
                Add Bookmark
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {myBookmarks.length > 0 && (
          <section>
            <h4 className="text-sm font-medium text-charcoal-500 dark:text-charcoal-400 mb-3 uppercase tracking-wide">
              My Bookmarks
            </h4>
            <BookmarkList bookmarks={myBookmarks} canEdit={true} />
          </section>
        )}

        {sharedBookmarks.length > 0 && (
          <section>
            <h4 className="text-sm font-medium text-charcoal-500 dark:text-charcoal-400 mb-3 uppercase tracking-wide">
              Room Bookmarks
            </h4>
            <BookmarkList bookmarks={sharedBookmarks} canEdit={false} />
          </section>
        )}

        {myBookmarks.length === 0 && sharedBookmarks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-charcoal-500 dark:text-charcoal-400">
            <Bookmark className="w-12 h-12 mb-4 opacity-50" aria-hidden="true" />
            <p className="font-medium">No bookmarks yet</p>
            <p className="text-sm mt-1">Add a bookmark to save your place</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface BookmarkListProps {
  bookmarks: BookmarkType[]
  canEdit: boolean
}

function BookmarkList({ bookmarks, canEdit }: BookmarkListProps) {
  const { setCurrentPage } = useReaderStore()

  return (
    <ul className="space-y-2" role="list">
      {bookmarks
        .slice()
        .sort((a, b) => a.pageNumber - b.pageNumber)
        .map((bookmark) => (
          <motion.li
            key={bookmark.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 p-3 bg-charcoal-50 dark:bg-charcoal-800/50 rounded-xl hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage(bookmark.pageNumber)}
              className="text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
              aria-label={`Go to page ${bookmark.pageNumber}`}
            >
              <BookOpen className="w-5 h-5" aria-hidden="true" />
            </Button>
            <div className="flex-1 min-w-0">
              {bookmark.label && (
                <p className="font-medium text-charcoal-900 dark:text-charcoal-100 truncate">
                  {bookmark.label}
                </p>
              )}
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                Page {bookmark.pageNumber} · {formatDate(bookmark.createdAt)}
                {bookmark.isShared && (
                  <span className="ml-2 inline-flex items-center gap-1 text-primary-600 dark:text-primary-400">
                    <Share2 className="w-3 h-3" aria-hidden="true" />
                    Shared
                  </span>
                )}
              </p>
            </div>
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => useRoomStore.getState().removeBookmark(bookmark.id)}
                className="text-charcoal-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                aria-label="Delete bookmark"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </Button>
            )}
          </motion.li>
        ))}
    </ul>
  )
}