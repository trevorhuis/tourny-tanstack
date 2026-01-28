import { useStore } from '@tanstack/react-form'

import { useFieldContext } from '@/hooks/form-context'

import { Button } from '@/components/ui/button'
import { Field, Label } from '@/components/ui/fieldset'
import { Select as ComponentSelect } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { Textarea } from '@/components/ui/textarea'

export function SubmitButton({ label }: { label: string }) {
  return <Button type="submit">{label}</Button>
}

function ErrorMessages({
  errors,
}: {
  errors: Array<string | { message: string }>
}) {
  return (
    <>
      {errors.map((error) => (
        <Text
          key={typeof error === 'string' ? error : error.message}
          color="red"
        >
          {typeof error === 'string' ? error : error.message}
        </Text>
      ))}
    </>
  )
}

export function TextField({
  label,
  placeholder,
  type = 'text',
}: {
  label: string
  placeholder?: string
  type?: 'text' | 'email' | 'password'
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <Field>
      <Label htmlFor={label}>{label}</Label>
      <Input
        type={type}
        value={field.state.value}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </Field>
  )
}

export function TextArea({
  label,
  rows = 3,
}: {
  label: string
  rows?: number
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <Field>
      <Label htmlFor={label}>{label}</Label>
      <Textarea
        value={field.state.value}
        onBlur={field.handleBlur}
        rows={rows}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </Field>
  )
}

export function Select({
  label,
  values,
}: {
  label: string
  values: Array<{ label: string; value: string }>
  placeholder?: string
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <Field>
      <Label htmlFor={label}>{label}</Label>
      <ComponentSelect
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      >
        {values.map((value) => (
          <option key={value.value} value={value.value}>
            {value.label}
          </option>
        ))}
      </ComponentSelect>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </Field>
  )
}

export function NumberSelect({
  label,
  options,
}: {
  label?: string
  options: Array<{ label: string; value: number }>
}) {
  const field = useFieldContext<number>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <Field>
      {label && <Label htmlFor={label}>{label}</Label>}
      <ComponentSelect
        name={field.name}
        value={String(field.state.value)}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(Number(e.target.value))}
      >
        <option value="0">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </ComponentSelect>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </Field>
  )
}

export function DateField({
  label,
  type = 'date',
}: {
  label: string
  type?: 'date' | 'datetime-local'
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <Field>
      <Label htmlFor={label}>{label}</Label>
      <Input
        type={type}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </Field>
  )
}

export function NumberField({ label }: { label: string }) {
  const field = useFieldContext<number>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <Field>
      <Label htmlFor={label}>{label}</Label>
      <Input
        type="number"
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(Number(e.target.value))}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </Field>
  )
}
