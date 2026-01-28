import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient()

export const signIn = async (email: string, password: string) => {
  await authClient.signIn.email({
    email,
    password,
  })
}

export const signUp = async (
  username: string,
  email: string,
  password: string,
) => {
  await authClient.signUp.email({
    name: username,
    email,
    password,
  })
}
