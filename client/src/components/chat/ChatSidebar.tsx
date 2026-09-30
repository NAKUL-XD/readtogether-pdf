import { useRef, useEffect, useState } from 'react'
import { Send, Paperclip, Smile } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { Avatar } from '@/components/ui'
import { useRoomStore, useUserStore } from '@/store'
import { socketService } from '@/services'
import { formatTime, cn } from '@/utils'
import type { ChatMessage } from '@/types'

interface ChatSidebarProps {
  onClose: () => void
}

export function ChatSidebar({ onClose }: ChatSidebarProps) {
  const { messages, currentUser, room, clearUnread } = useRoomStore()
  const { user } = useUserStore()
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    clearUnread()
    scrollToBottom()
  }, [messages, clearUnread])

  useEffect(() => {
    const handleReaction = () => {
      // Could show reaction in chat
    }
    window.addEventListener('reaction', handleReaction as EventListener)
    return () => window.removeEventListener('reaction', handleReaction as EventListener)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = () => {
    if (!message.trim() || !room || !currentUser) return
    socketService.sendChatMessage(message.trim())
    setMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTyping = () => {
    socketService.startTyping()
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping()
    }, 2000)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-charcoal-500 dark:text-charcoal-400">
            <p className="font-medium">No messages yet</p>
            <p className="text-sm mt-1">Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} isOwn={msg.userId === currentUser?.userId} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="p-4 border-t border-charcoal-200/50 dark:border-charcoal-700/50">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                handleTyping()
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full px-4 py-2.5 pr-12 bg-charcoal-100 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 rounded-full text-sm text-charcoal-900 dark:text-charcoal-100 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              aria-label="Chat message"
            />
            <div className="absolute right-3 bottom-2.5 flex items-center gap-1">
              <Button variant="ghost" size="icon" aria-label="Attach file">
                <Paperclip className="w-4 h-4" aria-hidden="true" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Emoji">
                <Smile className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
          <Button
            variant="primary"
            size="icon"
            onClick={handleSend}
            disabled={!message.trim()}
            aria-label="Send message"
            className="rounded-full"
          >
            <Send className="w-5 h-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  )
}

interface ChatMessageItemProps {
  message: ChatMessage
  isOwn: boolean
}

function ChatMessageItem({ message, isOwn }: ChatMessageItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-2 max-w-[80%]', isOwn ? 'ml-auto' : 'mr-auto')}
    >
      {!isOwn && (
        <Avatar
          name={message.displayName}
          src={message.avatar}
          size="sm"
          userId={message.userId}
        />
      )}
      <div className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start')}>
        {!isOwn && (
          <p className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400 mb-0.5 ml-1">
            {message.displayName}
          </p>
        )}
        <div
          className={cn(
            'relative px-4 py-2 rounded-2xl',
            isOwn
              ? 'bg-primary-600 text-white rounded-tr-sm'
              : 'bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-900 dark:text-charcoal-100 rounded-tl-sm'
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
        </div>
        <p className={cn('text-xs text-charcoal-400 dark:text-charcoal-500 mt-1', isOwn ? 'mr-1' : 'ml-1')}>
          {formatTime(message.createdAt)}
        </p>
      </div>
      {isOwn && <Avatar name={message.displayName} src={message.avatar} size="sm" userId={message.userId} />}
    </motion.div>
  )
}