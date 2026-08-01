'use client'

import { useState } from 'react'

export type FormField = {
  name: string
  label: string
  type?: 'text' | 'email' | 'number' | 'textarea' | 'select'
  required?: boolean
  options?: readonly { label: string; value: string }[]
  validate?(value: string): string | null
}

type SchemaFormProps = {
  fields: readonly FormField[]
  initialValues?: Record<string, string>
  submitLabel: string
  pending?: boolean
  onSubmit(values: Record<string, string>): void | Promise<void>
}

export function SchemaForm({
  fields,
  initialValues = {},
  submitLabel,
  pending,
  onSubmit,
}: SchemaFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  return (
    <form
      className="schema-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const values = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<
          string,
          string
        >
        const nextErrors = Object.fromEntries(
          fields.flatMap((field) => {
            const value = values[field.name]?.trim() ?? ''
            const error =
              field.required && !value ? `${field.label} is required` : field.validate?.(value)
            return error ? [[field.name, error]] : []
          }),
        )
        setErrors(nextErrors)
        if (Object.keys(nextErrors).length === 0) void onSubmit(values)
      }}
    >
      {fields.map((field) => {
        const errorId = `${field.name}-error`
        const common = {
          id: field.name,
          name: field.name,
          defaultValue: initialValues[field.name] ?? '',
          required: field.required,
          'aria-invalid': Boolean(errors[field.name]),
          'aria-describedby': errors[field.name] ? errorId : undefined,
        }
        return (
          <div key={field.name} className="schema-field">
            <label htmlFor={field.name}>{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea {...common} rows={4} />
            ) : field.type === 'select' ? (
              <select {...common}>
                <option value="">Select…</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            ) : (
              <input {...common} type={field.type ?? 'text'} />
            )}
            {errors[field.name] ? <p id={errorId} role="alert">{errors[field.name]}</p> : null}
          </div>
        )
      })}
      <button type="submit" className="primary-button" disabled={pending}>
        {pending ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
