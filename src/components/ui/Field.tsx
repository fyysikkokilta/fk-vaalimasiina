'use client'

import * as FieldParts from '@base-ui/react/field'
import * as React from 'react'

const inputClassName =
  'w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none'

const labelClassName = 'mb-2 block text-sm font-medium text-gray-700'
const errorClassName = 'mt-1 text-sm text-red-600'

export const Field = {
  Root: FieldParts.Field.Root,
  Label: React.forwardRef<
    HTMLSpanElement,
    React.ComponentProps<typeof FieldParts.Field.Label> & { className?: string }
  >(({ className = '', ...props }, ref) => (
    <FieldParts.Field.Label ref={ref} className={`${labelClassName} ${className}`} {...props} />
  )),
  Control: React.forwardRef<
    HTMLInputElement,
    React.ComponentProps<typeof FieldParts.Field.Control> & {
      className?: string
      render?: React.ElementType
    }
  >(({ className = '', ...props }, ref) => (
    <FieldParts.Field.Control ref={ref} className={`${inputClassName} ${className}`} {...props} />
  )),
  Error: React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<typeof FieldParts.Field.Error> & { className?: string }
  >(({ className = '', ...props }, ref) => (
    <FieldParts.Field.Error ref={ref} className={`${errorClassName} ${className}`} {...props} />
  ))
}

Field.Label.displayName = 'Field.Label'
Field.Control.displayName = 'Field.Control'
Field.Error.displayName = 'Field.Error'

export { inputClassName }
