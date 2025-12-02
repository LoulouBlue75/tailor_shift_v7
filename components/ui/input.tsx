'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  variant?: 'default' | 'underline'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      hint,
      variant = 'underline',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const inputId = id || React.useId()
    const isPassword = type === 'password'

    const baseStyles =
      'flex w-full bg-transparent text-[var(--charcoal)] placeholder:text-[var(--grey-400)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200'

    const variantStyles = {
      default:
        'h-10 rounded-[var(--radius-md)] border border-[var(--grey-200)] px-3 py-2 focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]',
      underline:
        'h-12 border-b border-[var(--grey-200)] px-0 py-3 focus:border-[var(--gold)] focus:border-b-2',
    }

    const errorStyles = error
      ? 'border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]'
      : ''

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-[var(--charcoal)]"
          >
            {label}
            {props.required && (
              <span className="ml-1 text-[var(--error)]">*</span>
            )}
          </label>
        )}
        <div className="relative">
          <input
            type={isPassword && showPassword ? 'text' : type}
            id={inputId}
            className={cn(
              baseStyles,
              variantStyles[variant],
              errorStyles,
              isPassword && 'pr-10',
              className
            )}
            ref={ref}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-[var(--grey-400)] hover:text-[var(--charcoal)] transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-xs text-[var(--error)]"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p
            id={`${inputId}-hint`}
            className="mt-1.5 text-xs text-[var(--grey-500)]"
          >
            {hint}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
