import { forwardRef, ImgHTMLAttributes } from 'react'
import { cn, getInitials, getColorForUser } from '@/utils'

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square'
  status?: 'online' | 'offline' | 'away'
  userId?: string
}

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
}

const statusSizes = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
}

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-charcoal-400',
  away: 'bg-amber-500',
}

export const Avatar = forwardRef<HTMLImageElement, AvatarProps>(
  ({ src, alt, name, size = 'md', shape = 'circle', status, userId, className, ...props }, ref) => {
    const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl'
    const bgColor = userId ? getColorForUser(userId) : 'bg-primary-500'
    const initials = name ? getInitials(name) : '?'

    return (
      <div className={cn('relative inline-flex shrink-0', className)}>
        {src ? (
          <img
            ref={ref}
            src={src}
            alt={alt || name || 'Avatar'}
            className={cn(sizes[size], shapeClass, 'object-cover')}
            {...props}
          />
        ) : (
          <div
            className={cn(sizes[size], shapeClass, bgColor, 'flex items-center justify-center font-medium text-white select-none')}
            aria-label={name ? `${name}'s avatar` : 'User avatar'}
          >
            {initials}
          </div>
        )}
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 border-2 border-white dark:border-charcoal-900',
              statusSizes[size],
              'rounded-full',
              statusColors[status]
            )}
            aria-label={status}
          />
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

export function AvatarGroup({ children, max = 5, className }: { children: React.ReactNode; max?: number; className?: string }) {
  const kids = Array.from({ length: max }, (_, i) => i)
    .map((i) => React.Children.toArray(children)[i])
    .filter(Boolean)

  return (
    <div className={cn('flex -space-x-2', className)} aria-label="User avatars">
      {kids.map((child, index) => (
        <div key={index} className={cn('relative z-10', index === 0 ? 'z-10' : `z-${10 - index}`)} style={{ zIndex: 10 - index }}>
          {child}
        </div>
      ))}
      {React.Children.count(children) > max && (
        <div className={cn(sizes.md, 'rounded-full bg-charcoal-100 dark:bg-charcoal-800 flex items-center justify-center font-medium text-charcoal-600 dark:text-charcoal-400 border-2 border-white dark:border-charcoal-900')}>
          +{React.Children.count(children) - max}
        </div>
      )}
    </div>
  )
}