import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
          {
            'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md hover:shadow-primary-600/25 focus:ring-primary-500 active:bg-primary-800': variant === 'primary',
            'bg-secondary-500 text-white hover:bg-secondary-600 hover:shadow-md hover:shadow-secondary-500/25 focus:ring-secondary-400 active:bg-secondary-700': variant === 'secondary',
            'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 hover:shadow-md focus:ring-primary-500': variant === 'outline',
            'text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-400': variant === 'ghost',
            'bg-error text-white hover:bg-red-600 hover:shadow-md hover:shadow-red-500/25 focus:ring-red-400': variant === 'danger',
          },
          {
            'text-xs px-3 py-1.5 rounded': size === 'sm',
            'text-sm px-4 py-2 rounded-md': size === 'md',
            'text-base px-6 py-3 rounded-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
