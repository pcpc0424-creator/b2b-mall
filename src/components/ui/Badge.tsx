import { cn } from '../../lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        {
          'bg-neutral-100 text-neutral-700': variant === 'default',
          'bg-primary-100 text-primary-700': variant === 'primary',
          'bg-secondary-100 text-secondary-700': variant === 'secondary',
          'bg-green-100 text-green-700': variant === 'success',
          'bg-amber-100 text-amber-700': variant === 'warning',
          'bg-red-100 text-red-700': variant === 'error',
        },
        {
          'text-xs px-2 py-0.5': size === 'sm',
          'text-sm px-2.5 py-1': size === 'md',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
