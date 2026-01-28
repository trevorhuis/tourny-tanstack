import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Link } from '@tanstack/react-router'
import { authMiddleware } from '@/middleware/auth-middleware'
import { getUserFromHeaders } from '@/lib/utils'

const getAdminUser = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async () => {
    const user = await getUserFromHeaders()

    if (!user) {
      throw redirect({ to: '/signin' })
    }

    if (user.role !== 'admin') {
      throw redirect({ to: '/' })
    }

    return user
  })

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    await getAdminUser()
  },
  component: AdminLayout,
})

const navItems = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/tournament', label: 'Tournaments' },
  { to: '/admin/team', label: 'Teams' },
  { to: '/admin/match', label: 'Matches' },
] as const

function AdminLayout() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center border-b border-zinc-200 px-6 dark:border-zinc-700">
              <span className="text-lg font-semibold">Admin Panel</span>
            </div>
            <nav className="flex-1 space-y-1 p-4">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === '/admin' }}
                  className="block rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 [&.active]:bg-zinc-100 [&.active]:text-zinc-900 dark:[&.active]:bg-zinc-700 dark:[&.active]:text-zinc-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-zinc-200 p-4 dark:border-zinc-700">
              <Link
                to="/"
                className="block rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
              >
                Back to App
              </Link>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="ml-64 min-h-screen flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
