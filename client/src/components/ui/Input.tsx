import { forwardRef, InputHTMLAttributes, LabelHTMLAttributes } from 'react'
import { cn } from '@/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-3 rounded-lg bg-white dark:bg-charcoal-900 border text-charcoal-900 dark:text-charcoal-100 placeholder-charcoal-400 transition-all duration-200',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : 'border-charcoal-300 dark:border-charcoal-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
          'focus:outline-none',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${props.id}-error`} className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
)

Input.displayName = 'Input'

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5', className)}
      {...props}
    >
      {children}
    </label>
  )
)

Label.displayName = 'Label'