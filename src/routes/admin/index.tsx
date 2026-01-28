import { createFileRoute } from '@tanstack/react-router'
import { getDashboardStats } from '@/lib/queries'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'

export const Route = createFileRoute('/admin/')({
  loader: async () => {
    const stats = await getDashboardStats()
    return { stats }
  },
  component: AdminDashboard,
})

function AdminDashboard() {
  const { stats } = Route.useLoaderData()

  const statCards = [
    { label: 'Total Users', value: stats.userCount },
    { label: 'Tournaments', value: stats.tournamentCount },
    { label: 'Groups', value: stats.groupCount },
    { label: 'Predictions', value: stats.matchPredictionCount },
  ]

  return (
    <div>
      <div className="mb-8">
        <Heading level={1}>Dashboard</Heading>
        <Text className="mt-2">Overview of your tournament platform.</Text>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <Text className="text-sm text-zinc-500 dark:text-zinc-400">
              {stat.label}
            </Text>
            <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
