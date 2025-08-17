'use client'

import { Slot } from '@radix-ui/react-slot'
import * as React from 'react'
import { cn } from '@/shared/utils'

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean
}

const VisuallyHidden = React.forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'span'
    return (
      <Comp
        ref={ref}
        className={cn(
          'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
          className
        )}
        {...props}
      />
    )
  }
)
VisuallyHidden.displayName = 'VisuallyHidden'

export { VisuallyHidden }
