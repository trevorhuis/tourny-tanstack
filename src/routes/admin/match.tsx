import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import * as z from 'zod'

import { useAppForm } from '@/hooks/form'
import {
  getAllTournaments,
  getTournamentTeams,
  getTournamentMatches,
} from '@/lib/queries'
import { createMatch, updateMatch } from '@/lib/mutations'
import { matchStatusEnum, roundEnum } from '@/db/schema'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTitle,
  DialogBody,
  DialogActions,
} from '@/components/ui/dialog'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'

export const Route = createFileRoute('/admin/match')({
  loader: async () => {
    const tournaments = await getAllTournaments()
    return { tournaments }
  },
  component: AdminMatch,
})

const statusOptions = matchStatusEnum.enumValues
const roundOptions = roundEnum.enumValues

const createMatchSchema = z.object({
  teamAId: z.number().min(1, 'Team A is required'),
  teamBId: z.number().min(1, 'Team B is required'),
  stadium: z.string().min(1, 'Stadium is required'),
  matchDatetime: z.string().min(1, 'Match date/time is required'),
  round: z.string().min(1, 'Round is required'),
  status: z.string().min(1, 'Status is required'),
})

const updateScoreSchema = z.object({
  teamAScore: z.number().min(0),
  teamBScore: z.number().min(0),
})

function AdminMatch() {
  const { tournaments } = Route.useLoaderData()

  const [selectedTournamentId, setSelectedTournamentId] = useState<number>(
    tournaments[0]?.id ?? 0,
  )
  const [matches, setMatches] = useState<
    {
      id: number
      teamAId: number
      teamBId: number
      stadium: string
      matchDatetime: Date
      round: string
      status: string
      teamAScore: number | null
      teamBScore: number | null
    }[]
  >([])
  const [teams, setTeams] = useState<
    { id: number; name: string; flag: string }[]
  >([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingMatch, setEditingMatch] = useState<{
    id: number
    teamAScore: number | null
    teamBScore: number | null
  } | null>(null)

  const loadTournamentData = async (tournamentId: number) => {
    setSelectedTournamentId(tournamentId)
    const [matchesData, teamsData] = await Promise.all([
      getTournamentMatches({ data: { tournamentId } }),
      getTournamentTeams({ data: { tournamentId } }),
    ])
    setMatches(matchesData)
    setTeams(teamsData)
  }

  const form = useAppForm({
    defaultValues: {
      teamAId: 0,
      teamBId: 0,
      stadium: '',
      matchDatetime: '',
      round: 'group',
      status: 'upcoming',
    },
    validators: {
      onChange: createMatchSchema,
    },
    onSubmit: async ({ value }) => {
      await createMatch({
        data: {
          tournamentId: selectedTournamentId,
          teamAId: value.teamAId,
          teamBId: value.teamBId,
          stadium: value.stadium,
          matchDatetime: new Date(value.matchDatetime),
          round: value.round as (typeof roundOptions)[number],
          status: value.status as (typeof statusOptions)[number],
        },
      })
      setShowCreateDialog(false)
      form.reset()
      await loadTournamentData(selectedTournamentId)
    },
  })

  const scoreForm = useAppForm({
    defaultValues: {
      teamAScore: 0,
      teamBScore: 0,
    },
    validators: {
      onChange: updateScoreSchema,
    },
    onSubmit: async ({ value }) => {
      if (!editingMatch) return
      await updateMatch({
        data: {
          id: editingMatch.id,
          data: {
            teamAScore: value.teamAScore,
            teamBScore: value.teamBScore,
            status: 'completed',
          },
        },
      })
      setEditingMatch(null)
      await loadTournamentData(selectedTournamentId)
    },
  })

  // Load initial data
  if (matches.length === 0 && tournaments.length > 0 && selectedTournamentId) {
    loadTournamentData(selectedTournamentId)
  }

  const getTeam = (teamId: number) => {
    return teams.find((t) => t.id === teamId)
  }

  const handleEditScore = (match: {
    id: number
    teamAScore: number | null
    teamBScore: number | null
  }) => {
    setEditingMatch(match)
    scoreForm.setFieldValue('teamAScore', match.teamAScore ?? 0)
    scoreForm.setFieldValue('teamBScore', match.teamBScore ?? 0)
  }

  const handleUpdateStatus = async (
    matchId: number,
    status: 'upcoming' | 'ongoing' | 'completed',
  ) => {
    await updateMatch({
      data: {
        id: matchId,
        data: { status },
      },
    })
    await loadTournamentData(selectedTournamentId)
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Heading level={1}>Matches</Heading>
          <Text className="mt-2">Manage tournament matches and scores.</Text>
        </div>
        <div className="flex gap-4">
          <select
            value={selectedTournamentId}
            onChange={(e) => loadTournamentData(Number(e.target.value))}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <Button
            color="zinc"
            onClick={() => setShowCreateDialog(true)}
            disabled={teams.length < 2}
          >
            Create Match
          </Button>
        </div>
      </div>

      {teams.length < 2 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-800">
          <Text>
            Not enough teams found for this tournament. Add at least 2 teams
            first.
          </Text>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Match
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Round
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Date/Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Stadium
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {matches.map((match) => {
                const teamA = getTeam(match.teamAId)
                const teamB = getTeam(match.teamBId)
                return (
                  <tr key={match.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <span>
                        {teamA?.flag} {teamA?.name} vs {teamB?.flag}{' '}
                        {teamB?.name}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {match.round
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {new Date(match.matchDatetime).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {match.stadium}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      {match.teamAScore !== null && match.teamBScore !== null
                        ? `${match.teamAScore} - ${match.teamBScore}`
                        : '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          match.status === 'ongoing'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : match.status === 'completed'
                              ? 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}
                      >
                        {match.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <Button plain onClick={() => handleEditScore(match)}>
                          Edit Score
                        </Button>
                        {match.status === 'upcoming' && (
                          <Button
                            plain
                            onClick={() =>
                              handleUpdateStatus(match.id, 'ongoing')
                            }
                          >
                            Start
                          </Button>
                        )}
                        {match.status === 'ongoing' && (
                          <Button
                            plain
                            onClick={() =>
                              handleUpdateStatus(match.id, 'completed')
                            }
                          >
                            End
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Match Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <DialogTitle>Create Match</DialogTitle>
          <DialogBody className="space-y-4">
            <form.AppField
              name="teamAId"
              children={(field) => (
                <field.NumberSelect
                  label="Team A (Home)"
                  options={teams.map((t) => ({
                    value: t.id,
                    label: `${t.flag} ${t.name}`,
                  }))}
                />
              )}
            />
            <form.AppField
              name="teamBId"
              children={(field) => (
                <field.NumberSelect
                  label="Team B (Away)"
                  options={teams.map((t) => ({
                    value: t.id,
                    label: `${t.flag} ${t.name}`,
                  }))}
                />
              )}
            />
            <form.AppField
              name="stadium"
              children={(field) => (
                <field.TextField
                  label="Stadium"
                  placeholder="MetLife Stadium"
                />
              )}
            />
            <form.AppField
              name="matchDatetime"
              children={(field) => (
                <field.DateField label="Date/Time" type="datetime-local" />
              )}
            />
            <form.AppField
              name="round"
              children={(field) => (
                <field.Select
                  label="Round"
                  values={roundOptions.map((r) => ({
                    value: r,
                    label: r
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (c) => c.toUpperCase()),
                  }))}
                />
              )}
            />
            <form.AppField
              name="status"
              children={(field) => (
                <field.Select
                  label="Status"
                  values={statusOptions.map((s) => ({
                    value: s,
                    label: s.charAt(0).toUpperCase() + s.slice(1),
                  }))}
                />
              )}
            />
          </DialogBody>
          <DialogActions>
            <Button plain onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <form.AppForm>
              <form.SubmitButton label="Create Match" />
            </form.AppForm>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Score Dialog */}
      <Dialog open={!!editingMatch} onClose={() => setEditingMatch(null)}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            scoreForm.handleSubmit()
          }}
        >
          <DialogTitle>Update Score</DialogTitle>
          <DialogBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <scoreForm.AppField
                name="teamAScore"
                children={(field) => <field.NumberField label="Team A Score" />}
              />
              <scoreForm.AppField
                name="teamBScore"
                children={(field) => <field.NumberField label="Team B Score" />}
              />
            </div>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={() => setEditingMatch(null)}>
              Cancel
            </Button>
            <scoreForm.AppForm>
              <scoreForm.SubmitButton label="Update Score" />
            </scoreForm.AppForm>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  )
}
