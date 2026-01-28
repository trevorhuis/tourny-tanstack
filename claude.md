# Tournament Prediction App

A full-stack tournament prediction application built with TanStack Start.

## Tech Stack

- **Framework**: TanStack React Start with Nitro runtime
- **Frontend**: React 19, TanStack Router (file-based), TanStack Query, TanStack Form
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Better Auth (email/password)
- **Styling**: Tailwind CSS 4
- **Validation**: Zod + Drizzle-Zod

## Project Structure

```
src/
├── routes/          # File-based routing (TanStack Router)
├── lib/             # Server functions, auth config, queries, mutations
├── db/              # Drizzle schema and database client
├── components/      # React components and UI primitives
├── hooks/           # Custom hooks (forms)
├── middleware/      # Auth middleware for protected routes
└── integrations/    # TanStack Query provider setup
```

## Key Patterns

### Server Functions
Use `createServerFn()` from `@tanstack/react-start` for all data fetching and mutations:
```ts
const getUser = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return context.user
  })
```

### Data Fetching
Define query options in `src/lib/api.ts` using `queryOptions()` from TanStack Query, then use in components or route loaders.

### Authentication
- Auth config in `src/lib/auth.ts`
- Client helpers in `src/lib/auth-client.ts`
- Use `authMiddleware` for protected server functions
- Auth API handled by catch-all route at `/api/auth/$`

### Forms
Use TanStack Form with Zod schemas from `src/lib/types.ts`. Form components in `src/components/FormComponents.tsx`.

### Database
- Schema with relations in `src/db/schema.ts`
- Run `pnpm db:generate` after schema changes, then `pnpm db:migrate`

## Commands

```bash
pnpm dev          # Start dev server (port 3000)
pnpm build        # Production build
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Drizzle Studio
pnpm lint         # ESLint
pnpm format       # Prettier
```

## Environment Variables

Required in `.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Auth secret key
