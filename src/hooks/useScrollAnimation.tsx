import React, { useEffect, useRef, useState } from 'react'
import { cn } from '../lib/utils'

interface UseScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
) {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce) {
            observer.unobserve(element)
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, triggerOnce])

  return { ref, isVisible }
}

// Animation types
type AnimationType = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'fade'

const animationStyles: Record<AnimationType, { initial: string; animate: string }> = {
  'fade-up': {
    initial: 'opacity-0 translate-y-8',
    animate: 'opacity-100 translate-y-0',
  },
  'fade-down': {
    initial: 'opacity-0 -translate-y-8',
    animate: 'opacity-100 translate-y-0',
  },
  'fade-left': {
    initial: 'opacity-0 translate-x-8',
    animate: 'opacity-100 translate-x-0',
  },
  'fade-right': {
    initial: 'opacity-0 -translate-x-8',
    animate: 'opacity-100 translate-x-0',
  },
  'zoom-in': {
    initial: 'opacity-0 scale-95',
    animate: 'opacity-100 scale-100',
  },
  'fade': {
    initial: 'opacity-0',
    animate: 'opacity-100',
  },
}

// Animated wrapper component
interface AnimatedProps {
  children: React.ReactNode
  animation?: AnimationType
  delay?: number
  duration?: number
  className?: string
  once?: boolean
}

export function Animated({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 500,
  className,
  once = true,
}: AnimatedProps) {
  const { ref, isVisible } = useScrollAnimation({ triggerOnce: once })
  const { initial, animate } = animationStyles[animation]

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all ease-out',
        isVisible ? animate : initial,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// Stagger animation for lists
interface StaggerProps {
  children: React.ReactNode[]
  animation?: AnimationType
  staggerDelay?: number
  duration?: number
  className?: string
  itemClassName?: string
}

export function Stagger({
  children,
  animation = 'fade-up',
  staggerDelay = 100,
  duration = 500,
  className,
  itemClassName,
}: StaggerProps) {
  const { ref, isVisible } = useScrollAnimation()
  const { initial, animate } = animationStyles[animation]

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          className={cn(
            'transition-all ease-out',
            isVisible ? animate : initial,
            itemClassName
          )}
          style={{
            transitionDuration: `${duration}ms`,
            transitionDelay: isVisible ? `${index * staggerDelay}ms` : '0ms',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
