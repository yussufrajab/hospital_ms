'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn('space-y-6', className)}
        {...props}
      >
        {children}
      </form>
    )
  }
)
Form.displayName = 'Form'

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, error, required, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-2', className)}
        {...props}
      >
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {children}
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)
FormField.displayName = 'FormField'

export { Form, FormField }
