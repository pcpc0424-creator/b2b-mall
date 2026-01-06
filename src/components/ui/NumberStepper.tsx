import { Minus, Plus } from 'lucide-react'
import { cn } from '../../lib/utils'

interface NumberStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function NumberStepper({
  value,
  onChange,
  min = 1,
  max = 9999,
  step = 1,
  disabled = false,
  size = 'md',
  className,
}: NumberStepperProps) {
  const handleDecrement = () => {
    if (value - step >= min) {
      onChange(value - step)
    }
  }

  const handleIncrement = () => {
    if (max === undefined || value + step <= max) {
      onChange(value + step)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10)
    if (!isNaN(newValue)) {
      if (newValue >= min && (max === undefined || newValue <= max)) {
        onChange(newValue)
      }
    }
  }

  return (
    <div
      className={cn(
        'inline-flex items-center border border-neutral-300 rounded-md overflow-hidden',
        disabled && 'opacity-50',
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={cn(
          'flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 transition-colors disabled:cursor-not-allowed disabled:hover:bg-neutral-50',
          size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
        )}
      >
        <Minus className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      </button>
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        className={cn(
          'border-x border-neutral-300 text-center focus:outline-none focus:bg-primary-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          size === 'sm' ? 'w-12 h-7 text-xs' : 'w-16 h-9 text-sm'
        )}
        min={min}
        max={max}
      />
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || (max !== undefined && value >= max)}
        className={cn(
          'flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 transition-colors disabled:cursor-not-allowed disabled:hover:bg-neutral-50',
          size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
        )}
      >
        <Plus className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      </button>
    </div>
  )
}
