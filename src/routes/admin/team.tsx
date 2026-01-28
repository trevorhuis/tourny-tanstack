import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import * as z from 'zod'

import { useAppForm } from '@/hooks/form'
import {
  getAllTournaments,
  getTournamentTeams,
  getTournamentGroups,
} from '@/lib/queries'
import { createTournamentTeam, updateTournamentTeam } from '@/lib/mutations'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTitle,
  DialogBody,
  DialogActions,
} from '@/components/ui/dialog'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'

export const Route = createFileRoute('/admin/team')({
  loader: async () => {
    const tournaments = await getAllTournaments()
    return { tournaments }
  },
  component: AdminTeam,
})

const createTeamSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  flag: z.string().min(1, 'Flag emoji is required'),
  tournamentGroupId: z.number().min(1, 'Group is required'),
})

function AdminTeam() {
  const { tournaments } = Route.useLoaderData()

  const [selectedTournamentId, setSelectedTournamentId] = useState<number>(
    tournaments[0]?.id ?? 0,
  )
  const [teams, setTeams] = useState<
    {
      id: number
      name: string
      flag: string
      tournamentGroupId: number
      status: string
    }[]
  >([])
  const [groups, setGroups] = useState<{ id: number; name: string }[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const loadTournamentData = async (tournamentId: number) => {
    setSelectedTournamentId(tournamentId)
    const [teamsData, groupsData] = await Promise.all([
      getTournamentTeams({ data: { tournamentId } }),
      getTournamentGroups({ data: { tournamentId } }),
    ])
    setTeams(teamsData)
    setGroups(groupsData)
  }

  const form = useAppForm({
    defaultValues: {
      name: '',
      flag: '',
      tournamentGroupId: 0,
    },
    validators: {
      onChange: createTeamSchema,
    },
    onSubmit: async ({ value }) => {
      await createTournamentTeam({
        data: {
          name: value.name,
          flag: value.flag,
          tournamentId: selectedTournamentId,
          tournamentGroupId: value.tournamentGroupId,
        },
      })
      setShowCreateDialog(false)
      form.reset()
      await loadTournamentData(selectedTournamentId)
    },
  })

  const handleUpdateStatus = async (
    teamId: number,
    status: 'active' | 'eliminated' | 'winner',
  ) => {
    await updateTournamentTeam({
      data: {
        id: teamId,
        data: { status },
      },
    })
    await loadTournamentData(selectedTournamentId)
  }

  // Load initial data
  if (teams.length === 0 && tournaments.length > 0 && selectedTournamentId) {
    loadTournamentData(selectedTournamentId)
  }

  const getGroupName = (groupId: number) => {
    return groups.find((g) => g.id === groupId)?.name ?? 'Unknown'
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Heading level={1}>Teams</Heading>
          <Text className="mt-2">Manage tournament teams.</Text>
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
            disabled={groups.length === 0}
          >
            Add Team
          </Button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-800">
          <Text>
            No groups found for this tournament. Create groups first in the
            Tournaments section.
          </Text>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Group
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
              {teams.map((team) => (
                <tr key={team.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <span className="mr-2">{team.flag}</span>
                    {team.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                    {getGroupName(team.tournamentGroupId)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        team.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : team.status === 'winner'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {team.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      {team.status !== 'active' && (
                        <Button
                          plain
                          onClick={() => handleUpdateStatus(team.id, 'active')}
                        >
                          Set Active
                        </Button>
                      )}
                      {team.status !== 'eliminated' && (
                        <Button
                          plain
                          onClick={() =>
                            handleUpdateStatus(team.id, 'eliminated')
                          }
                        >
                          Eliminate
                        </Button>
                      )}
                      {team.status !== 'winner' && (
                        <Button
                          plain
                          onClick={() => handleUpdateStatus(team.id, 'winner')}
                        >
                          Set Winner
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Team Dialog */}
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
          <DialogTitle>Add Team</DialogTitle>
          <DialogBody className="space-y-4">
            <form.AppField
              name="name"
              children={(field) => (
                <field.TextField label="Team Name" placeholder="Brazil" />
              )}
            />
            <form.AppField
              name="flag"
              children={(field) => (
                <field.TextField label="Flag Emoji" placeholder="🇧🇷" />
              )}
            />
            <form.AppField
              name="tournamentGroupId"
              children={(field) => (
                <field.NumberSelect
                  label="Group"
                  options={groups.map((g) => ({
                    value: g.id,
                    label: g.name,
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
              <form.SubmitButton label="Add Team" />
            </form.AppForm>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  )
}
