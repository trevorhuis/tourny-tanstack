import { createFileRoute, useNavigate } from '@tanstack/react-router'
import * as z from 'zod'
import { signIn } from '@/lib/auth-client'
import { useAppForm } from '@/hooks/form'

import { AuthLayout } from '@/components/ui/auth-layout'
import { Heading } from '@/components/ui/heading'
import { Text, Strong, TextLink } from '@/components/ui/text'

export const Route = createFileRoute('/signin')({
  component: Signin,
})

const schema = z.object({
  email: z.email(),
  password: z.string().min(6).max(100),
})

const defaultValues: z.input<typeof schema> = {
  email: '',
  password: '',
}

function Signin() {
  const navigate = useNavigate({ from: '/signin' })

  const formOpts = {
    initialValues: defaultValues,
    validators: {
      onChange: schema,
    },
    onSubmit: async ({ value }: { value: z.infer<typeof schema> }) => {
      await signIn(value.email, value.password)
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
        <Heading>Sign in</Heading>
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
          Don’t have an account?{' '}
          <TextLink href="/signup">
            <Strong>Sign up</Strong>
          </TextLink>
        </Text>
      </form>
    </AuthLayout>
  )
}
