import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from '../db/index.ts';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
        input: false,
      },
      country: {
        type: 'string',
        required: false,
        defaultValue: null,
      },
      countryFlag: {
        type: 'string',
        required: false,
        defaultValue: null,
      },
    },
  },
  plugins: [tanstackStartCookies()]
})
