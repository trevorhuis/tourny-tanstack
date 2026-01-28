import { createFileRoute, useNavigate } from '@tanstack/react-router'
import * as z from 'zod'

import { useAppForm } from '@/hooks/form'
import { signUp } from '@/lib/auth-client'

import { AuthLayout } from '@/components/ui/auth-layout'
import { Heading } from '@/components/ui/heading'
import { Text, Strong, TextLink } from '@/components/ui/text'

export const Route = createFileRoute('/signup')({
  component: Signup,
})

const schema = z.object({
  username: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(6).max(100),
})

const defaultValues: z.input<typeof schema> = {
  username: '',
  email: '',
  password: '',
}

function Signup() {
  const navigate = useNavigate({ from: '/signin' })

  const formOpts = {
    initialValues: defaultValues,
    validators: {
      onChange: schema,
    },
    onSubmit: async ({ value }: { value: z.infer<typeof schema> }) => {
      try {
        await signUp(value.username, value.email, value.password)
      } catch (error) {
        console.error(error)
        return {}
      }
      await navigate({ to: '/' })
    },
  }

  const form = useAppForm(formOpts)

  return (
    <AuthLayout>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="grid w-full max-w-sm grid-cols-1 gap-8"
      >
        <Heading>Sign Up</Heading>
        <form.AppField
          name="username"
          children={(field) => <field.TextField label="Public Username" />}
        />
        <form.AppField
          name="email"
          children={(field) => <field.TextField label="Email" type="email" />}
        />
        <form.AppField
          name="password"
          children={(field) => (
            <field.TextField label="Password" type="password" />
          )}
        />
        <form.AppForm>
          <form.SubmitButton label="Submit" />
        </form.AppForm>
        <Text>
          Already have an account?{' '}
          <TextLink href="/signin">
            <Strong>Sign in</Strong>
          </TextLink>
        </Text>
      </form>
    </AuthLayout>
  )
}
