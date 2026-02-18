'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { cn } from '@/ui/components/ui/cn'

type GsapRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  duration?: number
}

export default function GsapReveal({
  children,
  className,
  delay = 0,
  y = 18,
  duration = 0.28,
}: GsapRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      return
    }

    // Clamp animation values so route transitions stay snappy.
    const revealDelay = Math.min(Math.max(delay, 0), 0.05)
    const revealDuration = Math.min(Math.max(duration, 0.16), 0.24)
    const revealY = Math.min(Math.max(y, 0), 10)

    const animation = gsap.fromTo(
      element,
      { opacity: 0.88, y: revealY },
      {
        opacity: 1,
        y: 0,
        delay: revealDelay,
        duration: revealDuration,
        ease: 'power1.out',
        clearProps: 'transform',
      },
    )

    return () => {
      animation.kill()
    }
  }, [delay, duration, y])

  return <div ref={ref} className={cn(className)}>{children}</div>
}
