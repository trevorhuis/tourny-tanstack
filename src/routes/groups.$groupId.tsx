import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import {
  getGroup,
  getGroupPlayersWithScores,
  getLatestTournament,
  getCurrentUser,
} from '@/lib/queries'
import { removePlayerFromGroup, deleteGroup } from '@/lib/mutations'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTitle,
  DialogBody,
  DialogActions,
} from '@/components/ui/dialog'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '@/components/ui/table'

export const Route = createFileRoute('/groups/$groupId')({
  loader: async ({ params }) => {
    const groupId = parseInt(params.groupId)

    const [group, tournament, user] = await Promise.all([
      getGroup({ data: { groupId } }),
      getLatestTournament(),
      getCurrentUser(),
    ])

    if (!group || !tournament) {
      return { data: null, error: 'Group or tournament not found' }
    }

    const players = await getGroupPlayersWithScores({
      data: { groupId, tournamentId: tournament.id },
    })

    return {
      data: { group, user, players, tournament },
      error: null,
    }
  },
  component: GroupDetail,
})

function GroupDetail() {
  const { data, error } = Route.useLoaderData()
  const navigate = useNavigate()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [playerToRemove, setPlayerToRemove] = useState<{
    userId: string
    username: string
  } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  if (error || !data || !data.group || !data.tournament) {
    return <div>{error}</div>
  }

  const { group, user, players, tournament } = data

  const isAdmin = user.id === group.adminId

  const handleDeleteGroup = async () => {
    setIsDeleting(true)
    try {
      await deleteGroup({ data: { groupId: group.id } })
      await navigate({ to: '/groups' })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRemovePlayer = async () => {
    if (!playerToRemove) return

    setIsRemoving(true)
    try {
      await removePlayerFromGroup({
        data: { groupId: group.id, userId: playerToRemove.userId },
      })
      setShowRemoveDialog(false)
      setPlayerToRemove(null)
      // Reload the page to refresh the player list
      window.location.reload()
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <Heading level={1} className="break-words">
              {group.name}
            </Heading>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge color="blue" className="font-xs">
                {tournament.name}
              </Badge>
              {isAdmin && <Badge color="green">Admin</Badge>}
            </div>
          </div>
          {isAdmin && (
            <Button
              color="zinc"
              className="w-full sm:w-auto"
              href={`/groups/${group.id}/invite`}
            >
              Invite Players
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <div>
          <Heading level={2} className="mb-4">
            Players ({players.length})
          </Heading>

          {players.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 py-8 text-center dark:border-zinc-700 sm:py-12">
              <Text className="text-zinc-500">
                No players in this group yet.
              </Text>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto sm:block">
                <Table striped>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Rank</TableHeader>
                      <TableHeader>Username</TableHeader>
                      <TableHeader>Score</TableHeader>
                      {isAdmin && <TableHeader>Actions</TableHeader>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...players]
                      .sort((a, b) => b.score - a.score)
                      .map((player, index) => (
                        <TableRow key={player.id}>
                          <TableCell>
                            <Text className="font-medium">#{index + 1}</Text>
                          </TableCell>
                          <TableCell>
                            <Text className="font-medium">
                              {player.username}
                            </Text>
                          </TableCell>
                          <TableCell>
                            <Text>{player.score}</Text>
                          </TableCell>
                          {isAdmin && (
                            <TableCell>
                              <Button
                                plain
                                onClick={() => {
                                  setPlayerToRemove({
                                    userId: player.userId,
                                    username: player.username,
                                  })
                                  setShowRemoveDialog(true)
                                }}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-3 sm:hidden">
                {[...players]
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div
                      key={player.id}
                      className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Text className="font-medium text-zinc-600 dark:text-zinc-400">
                            #{index + 1}
                          </Text>
                          <Text className="font-medium">{player.username}</Text>
                        </div>
                        <Text className="font-medium">{player.score} pts</Text>
                      </div>
                      {isAdmin && (
                        <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-700">
                          <Button
                            plain
                            onClick={() => {
                              setPlayerToRemove({
                                userId: player.userId,
                                username: player.username,
                              })
                              setShowRemoveDialog(true)
                            }}
                            className="w-full"
                          >
                            Remove Player
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>

        <div>
          <Heading level={2} className="mb-4">
            Group Settings
          </Heading>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800 sm:p-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-0">
                <Text className="font-medium">Admin</Text>
                <Text className="text-zinc-600 dark:text-zinc-400 sm:text-zinc-900 sm:dark:text-zinc-100">
                  {user.name}
                </Text>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-0">
                <Text className="font-medium">Tournament</Text>
                <Text className="text-zinc-600 dark:text-zinc-400 sm:text-zinc-900 sm:dark:text-zinc-100">
                  {group.tournament?.name}
                </Text>
              </div>
            </div>

            {isAdmin && (
              <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-700">
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
                  <Button plain className="w-full sm:w-auto">
                    Edit Group
                  </Button>
                  <Button
                    plain
                    onClick={() => setShowDeleteDialog(true)}
                    className="w-full text-red-600 hover:text-red-700 sm:w-auto"
                  >
                    Delete Group
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        className="sm:max-w-md"
      >
        <DialogTitle>Delete Group</DialogTitle>
        <DialogBody>
          <Text>
            Are you sure you want to delete "{group.name}"? This action cannot
            be undone and will remove all player data and predictions associated
            with this group.
          </Text>
        </DialogBody>
        <DialogActions className="flex-col gap-3 sm:flex-row sm:gap-2">
          <Button
            plain
            onClick={() => setShowDeleteDialog(false)}
            className="order-2 w-full sm:order-1 sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleDeleteGroup}
            disabled={isDeleting}
            className="order-1 w-full sm:order-2 sm:w-auto"
          >
            {isDeleting ? 'Deleting...' : 'Delete Group'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showRemoveDialog}
        onClose={() => setShowRemoveDialog(false)}
        className="sm:max-w-md"
      >
        <DialogTitle>Remove Player</DialogTitle>
        <DialogBody>
          <Text>
            Are you sure you want to remove "{playerToRemove?.username}" from
            this group? They will lose access to the group and their predictions
            will be removed.
          </Text>
        </DialogBody>
        <DialogActions className="flex-col gap-3 sm:flex-row sm:gap-2">
          <Button
            plain
            onClick={() => {
              setShowRemoveDialog(false)
              setPlayerToRemove(null)
            }}
            className="order-2 w-full sm:order-1 sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleRemovePlayer}
            disabled={isRemoving}
            className="order-1 w-full sm:order-2 sm:w-auto"
          >
            {isRemoving ? 'Removing...' : 'Remove Player'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
