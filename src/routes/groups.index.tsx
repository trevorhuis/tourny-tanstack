import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import * as z from 'zod'

import { useAppForm } from '@/hooks/form'
import {
  getGroupsForUser,
  getLatestTournament,
  getCurrentUser,
} from '@/lib/queries'
import { createGroup } from '@/lib/mutations'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTitle,
  DialogBody,
  DialogActions,
} from '@/components/ui/dialog'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'

export const Route = createFileRoute('/groups/')({
  loader: async () => {
    const tournament = await getLatestTournament()
    if (!tournament) {
      return { data: null, error: 'Tournament not found' }
    }

    const [groups, user] = await Promise.all([
      getGroupsForUser({ data: { tournamentId: tournament.id } }),
      getCurrentUser(),
    ])

    return { data: { groups, tournament, user }, error: null }
  },
  component: Groups,
})

const createGroupSchema = z.object({
  groupName: z.string().min(1, 'Group name is required'),
})

function Groups() {
  const { data, error } = Route.useLoaderData()
  const navigate = useNavigate()

  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const form = useAppForm({
    defaultValues: {
      groupName: '',
    },
    validators: {
      onChange: createGroupSchema,
    },
    onSubmit: async ({ value }) => {
      if (!data) return

      const groupId = await createGroup({
        data: {
          tournamentId: data.tournament.id,
          name: value.groupName,
        },
      })

      setShowCreateDialog(false)
      form.reset()
      await navigate({
        to: '/groups/$groupId',
        params: { groupId: String(groupId) },
      })
    },
  })

  if (error || !data) {
    return <div>{error}</div>
  }

  const { groups, tournament, user } = data

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-col items-center justify-between gap-y-2 md:flex-row">
        <div>
          <Heading level={1}>My Groups</Heading>
          <Text className="mt-2">
            Manage your tournament groups and invite players to compete.
          </Text>
        </div>
        <Button
          className="w-full md:w-auto"
          color="zinc"
          onClick={() => setShowCreateDialog(true)}
        >
          Create Group
        </Button>
      </div>
      <div className="space-y-8">
        <div>
          <Heading level={2} className="mb-4 text-xl font-semibold">
            {tournament.name}
          </Heading>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((item) => (
              <div
                key={item.group.id}
                className="rounded-lg border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
              >
                <div className="mb-4 flex flex-col items-start justify-between">
                  <Heading level={3} className="text-lg font-semibold">
                    {item.group.name}
                  </Heading>
                </div>

                <div className="flex items-center justify-between">
                  {item.group.adminId === user.id && (
                    <Text className="text-sm text-zinc-500">Admin</Text>
                  )}
                  <div className="flex gap-2">
                    <Button plain href={`/groups/${item.group.id}`}>
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
          <DialogTitle>Create New Group</DialogTitle>
          <DialogBody className="space-y-6">
            <form.AppField
              name="groupName"
              children={(field) => (
                <field.TextField
                  label="Group Name"
                  placeholder="Enter group name"
                />
              )}
            />
          </DialogBody>
          <DialogActions>
            <Button plain onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <form.AppForm>
              <form.SubmitButton label="Create Group" />
            </form.AppForm>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  )
}
