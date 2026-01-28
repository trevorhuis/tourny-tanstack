import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery, useQuery } from '@tanstack/react-query'

import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'
import {
  latestTournamentQueryOptions,
  globalLeaderboardQueryOptions,
  userLeaderboardScoreQueryOptions,
} from '@/lib/api'
import { getUserFromHeaders } from '@/lib/utils'

export const Route = createFileRoute('/leaderboard')({
  loader: async ({ context }) => {
    const tournament = await context.queryClient.ensureQueryData(
      latestTournamentQueryOptions(),
    )

    if (!tournament) {
      return { tournamentId: null, currentUser: null }
    }

    // Pre-fetch leaderboard data
    context.queryClient.ensureQueryData(
      globalLeaderboardQueryOptions(tournament.id),
    )

    // Try to get current user (may be null if not logged in)
    let currentUser = null
    try {
      currentUser = await getUserFromHeaders()
      if (currentUser) {
        context.queryClient.ensureQueryData(
          userLeaderboardScoreQueryOptions(tournament.id),
        )
      }
    } catch {
      // User not authenticated, continue without user data
    }

    return {
      tournamentId: tournament.id,
      currentUser: currentUser
        ? { id: currentUser.id, name: currentUser.name }
        : null,
    }
  },
  component: Leaderboard,
})

function Leaderboard() {
  const { tournamentId, currentUser } = Route.useLoaderData()

  if (!tournamentId) {
    return <div>Tournament not found</div>
  }

  return (
    <LeaderboardContent tournamentId={tournamentId} currentUser={currentUser} />
  )
}

function LeaderboardContent({
  tournamentId,
  currentUser,
}: {
  tournamentId: number
  currentUser: { id: string; name: string } | null
}) {
  const { data: tournament } = useSuspenseQuery(latestTournamentQueryOptions())
  const { data: leaderboard } = useSuspenseQuery(
    globalLeaderboardQueryOptions(tournamentId),
  )

  // Only fetch user score if logged in
  const { data: currentUserScore } = useQuery({
    ...userLeaderboardScoreQueryOptions(tournamentId),
    enabled: !!currentUser,
  })

  // Find current user's rank
  let currentUserRank: number | null = null
  if (currentUser) {
    const userIndex = leaderboard.findIndex(
      (player) => player.id === currentUser.id,
    )
    if (userIndex !== -1) {
      currentUserRank = userIndex + 1
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Heading level={1}>Global Leaderboard</Heading>
        <Text className="mt-2">Top 50 players for {tournament?.name}.</Text>
      </div>

      {/* Current User Stats */}
      {currentUser && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                Your Position
              </h2>
            </div>
            <div className="text-right">
              {currentUserRank ? (
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  #{currentUserRank}
                </div>
              ) : (
                <div className="text-lg text-blue-600 dark:text-blue-400">
                  Not ranked yet
                </div>
              )}
              <div className="text-sm text-blue-600 dark:text-blue-400">
                {currentUserScore || 0} points
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="grid grid-cols-4 gap-4 font-semibold text-sm">
            <div className="w-12">Rank</div>
            <div>Player</div>
            <div className="text-right">Score</div>
            <div className="w-8"></div>
          </div>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {leaderboard.length > 0 ? (
            leaderboard.map((player, index) => {
              const isCurrentUser = currentUser && player.id === currentUser.id
              return (
                <div
                  key={player.id}
                  className={`px-6 py-4 transition-colors ${
                    isCurrentUser
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                      : 'hover:bg-gray-50 dark:hover:bg-zinc-700'
                  }`}
                >
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <div
                      className={`font-medium ${isCurrentUser ? 'text-blue-600 dark:text-blue-400' : ''}`}
                    >
                      #{index + 1}
                    </div>
                    <div
                      className={`font-medium ${isCurrentUser ? 'text-blue-600 dark:text-blue-400' : ''}`}
                    >
                      {player.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                          (You)
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-right font-mono ${isCurrentUser ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''}`}
                    >
                      {player.score}
                    </div>
                    <div className="flex justify-end">
                      {index === 0 && (
                        <span className="text-yellow-500">🥇</span>
                      )}
                      {index === 1 && <span className="text-gray-400">🥈</span>}
                      {index === 2 && (
                        <span className="text-amber-600">🥉</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              <p>No players on the leaderboard yet.</p>
              <p className="text-sm mt-1">
                Make some predictions to get started!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
