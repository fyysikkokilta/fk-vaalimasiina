'use client'

import { Button as BaseButton } from '@base-ui/react/button'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { HookActionStatus } from 'next-safe-action/hooks'
import { ComponentPropsWithoutRef, forwardRef } from 'react'

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer'

const variantClasses = {
  primary: 'bg-gray-900 text-white hover:bg-gray-800 focus-visible:ring-gray-900',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-500',
  yellow: 'bg-fk-yellow text-fk-black hover:bg-amber-500 focus-visible:ring-amber-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
  outline:
    'border border-amber-50 text-white hover:bg-white/10 hover:text-white/90 focus-visible:ring-amber-50'
} as const

const sizeClasses = {
  default: 'px-4 py-2',
  small: 'px-3 py-1.5 text-sm'
} as const

export interface ButtonProps extends Omit<
  ComponentPropsWithoutRef<typeof BaseButton>,
  'className'
> {
  variant?: keyof typeof variantClasses
  size?: keyof typeof sizeClasses
  /** Action status from useAction. Drives loading spinner and error state. */
  actionStatus?: HookActionStatus
  className?: string
}

const isPending = (s: HookActionStatus | undefined) => s === 'executing' || s === 'transitioning'
const hasError = (s: HookActionStatus | undefined) => s === 'hasErrored'

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'default',
      actionStatus,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const pending = isPending(actionStatus)
    const error = hasError(actionStatus)
    const mergedClass = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      error && 'border-2 border-red-500 ring-2 ring-red-500/30',
      className
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <BaseButton
        ref={ref}
        className={mergedClass}
        disabled={disabled ?? pending}
        aria-invalid={error ? true : undefined}
        {...props}
      >
        {pending && <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />}
        {error && !pending && (
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
        )}
        {children}
      </BaseButton>
    )
  }
)
Button.displayName = 'Button'
