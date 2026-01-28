import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import * as z from 'zod'

import { useAppForm } from '@/hooks/form'
import { getAllTournaments, getTournamentGroups } from '@/lib/queries'
import { createTournament, createTournamentGroup } from '@/lib/mutations'
import { tournamentStatusEnum, roundEnum } from '@/db/schema'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTitle,
  DialogBody,
  DialogActions,
} from '@/components/ui/dialog'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'

export const Route = createFileRoute('/admin/tournament')({
  loader: async () => {
    const tournaments = await getAllTournaments()
    return { tournaments }
  },
  component: AdminTournament,
})

const statusOptions = tournamentStatusEnum.enumValues
const roundOptions = roundEnum.enumValues

const createTournamentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  location: z.string().min(1, 'Location is required'),
  status: z.string().min(1, 'Status is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  currentStage: z.string().min(1, 'Current stage is required'),
})

const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
})

function AdminTournament() {
  const { tournaments } = Route.useLoaderData()

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showGroupDialog, setShowGroupDialog] = useState(false)
  const [selectedTournamentId, setSelectedTournamentId] = useState<
    number | null
  >(null)
  const [tournamentGroups, setTournamentGroups] = useState<
    { id: number; name: string }[]
  >([])

  const form = useAppForm({
    defaultValues: {
      name: '',
      slug: '',
      location: '',
      status: 'upcoming',
      startDate: '',
      endDate: '',
      currentStage: 'group',
    },
    validators: {
      onChange: createTournamentSchema,
    },
    onSubmit: async ({ value }) => {
      await createTournament({
        data: {
          name: value.name,
          slug: value.slug,
          location: value.location,
          status: value.status as 'upcoming' | 'ongoing' | 'completed',
          startDate: new Date(value.startDate),
          endDate: new Date(value.endDate),
          currentStage: value.currentStage as (typeof roundOptions)[number],
        },
      })
      setShowCreateDialog(false)
      form.reset()
      window.location.reload()
    },
  })

  const groupForm = useAppForm({
    defaultValues: {
      name: '',
    },
    validators: {
      onChange: createGroupSchema,
    },
    onSubmit: async ({ value }) => {
      if (!selectedTournamentId) return
      await createTournamentGroup({
        data: {
          name: value.name,
          tournamentId: selectedTournamentId,
        },
      })
      setShowGroupDialog(false)
      groupForm.reset()
      // Refresh groups
      const groups = await getTournamentGroups({
        data: { tournamentId: selectedTournamentId },
      })
      setTournamentGroups(groups)
    },
  })

  const handleManageGroups = async (tournamentId: number) => {
    setSelectedTournamentId(tournamentId)
    const groups = await getTournamentGroups({ data: { tournamentId } })
    setTournamentGroups(groups)
    setShowGroupDialog(true)
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Heading level={1}>Tournaments</Heading>
          <Text className="mt-2">Manage tournaments and their groups.</Text>
        </div>
        <Button color="zinc" onClick={() => setShowCreateDialog(true)}>
          Create Tournament
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {tournaments.map((tournament) => (
              <tr key={tournament.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  {tournament.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                  {tournament.location}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      tournament.status === 'ongoing'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : tournament.status === 'completed'
                          ? 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {tournament.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                  {new Date(tournament.startDate).toLocaleDateString()} -{' '}
                  {new Date(tournament.endDate).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <Button
                    plain
                    onClick={() => handleManageGroups(tournament.id)}
                  >
                    Manage Groups
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Tournament Dialog */}
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
          <DialogTitle>Create Tournament</DialogTitle>
          <DialogBody className="space-y-4">
            <form.AppField
              name="name"
              children={(field) => (
                <field.TextField label="Name" placeholder="World Cup 2026" />
              )}
            />
            <form.AppField
              name="slug"
              children={(field) => (
                <field.TextField label="Slug" placeholder="world-cup-2026" />
              )}
            />
            <form.AppField
              name="location"
              children={(field) => (
                <field.TextField
                  label="Location"
                  placeholder="USA, Canada, Mexico"
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
            <form.AppField
              name="currentStage"
              children={(field) => (
                <field.Select
                  label="Current Stage"
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
              name="startDate"
              children={(field) => <field.DateField label="Start Date" />}
            />
            <form.AppField
              name="endDate"
              children={(field) => <field.DateField label="End Date" />}
            />
          </DialogBody>
          <DialogActions>
            <Button plain onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <form.AppForm>
              <form.SubmitButton label="Create" />
            </form.AppForm>
          </DialogActions>
        </form>
      </Dialog>

      {/* Manage Groups Dialog */}
      <Dialog open={showGroupDialog} onClose={() => setShowGroupDialog(false)}>
        <DialogTitle>Tournament Groups</DialogTitle>
        <DialogBody className="space-y-4">
          <div className="space-y-2">
            {tournamentGroups.length === 0 ? (
              <Text>No groups yet. Create one below.</Text>
            ) : (
              tournamentGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-2 dark:border-zinc-700"
                >
                  <span>{group.name}</span>
                </div>
              ))
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              groupForm.handleSubmit()
            }}
            className="flex gap-2"
          >
            <groupForm.AppField
              name="name"
              children={(field) => (
                <field.TextField label="Name" placeholder="Group A" />
              )}
            />
            <groupForm.AppForm>
              <groupForm.SubmitButton label="Add" />
            </groupForm.AppForm>
          </form>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setShowGroupDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
