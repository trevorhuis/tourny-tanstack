import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { getGroupByInviteCode, getCurrentUser } from '@/lib/queries'
import { joinGroupWithInviteCode } from '@/lib/mutations'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/groups/join/$code')({
  loader: async ({ params }) => {
    const { code } = params

    const inviteCodeData = await getGroupByInviteCode({ data: { code } })

    if (!inviteCodeData) {
      return { data: null, error: 'Invalid invite code' }
    }

    const safeGetUser = async () => {
      try {
        return await getCurrentUser()
      } catch {
        return null
      }
    }

    // Try to get current user (may not be logged in)
    let isUserInGroup = false
    let user = await safeGetUser()
    isUserInGroup = inviteCodeData.group.members.some(
      (member) => member.userId === user?.id,
    )

    return {
      data: { user, group: inviteCodeData.group, isUserInGroup },
      error: null,
    }
  },
  component: GroupJoin,
})

function GroupJoin() {
  const { data, error } = Route.useLoaderData()
  const { code } = Route.useParams()
  const navigate = useNavigate()

  const [isJoining, setIsJoining] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  if (error || !data || !data.group) {
    return (
      <div className="mx-auto max-w-md p-4 text-center sm:p-6">
        <Heading level={1} className="mb-4 text-red-600">
          Invalid Invite Code
        </Heading>
        <Text className="text-zinc-600 dark:text-zinc-400">
          This invite code is not valid or has expired.
        </Text>
      </div>
    )
  }

  const { user, group, isUserInGroup } = data

  const handleJoinGroup = async () => {
    setIsJoining(true)
    setActionError(null)
    try {
      const joinedGroup = await joinGroupWithInviteCode({ data: { code } })
      await navigate({
        to: '/groups/$groupId',
        params: { groupId: String(joinedGroup.id) },
      })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="mx-auto max-w-md p-4 sm:p-6">
      <div className="mb-8 text-center">
        <Heading level={1} className="mb-4">
          Join Group
        </Heading>
        <Text className="text-zinc-600 dark:text-zinc-400">
          You've been invited to join a group
        </Text>
      </div>

      <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
        <div className="mb-6 text-center">
          <Heading level={2} className="mb-2">
            {group.name}
          </Heading>
          <Badge color="blue" className="mb-4">
            {group.tournament?.name || 'Tournament'}
          </Badge>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <Text className="text-zinc-600 dark:text-zinc-400">Admin:</Text>
            <Text className="font-medium">
              {group.admin?.name || 'Unknown'}
            </Text>
          </div>
          <div className="flex items-center justify-between">
            <Text className="text-zinc-600 dark:text-zinc-400">Members:</Text>
            <Text className="font-medium">
              {group.members?.length || 0}/500
            </Text>
          </div>
          <div className="flex items-center justify-between">
            <Text className="text-zinc-600 dark:text-zinc-400">
              Tournament:
            </Text>
            <Text className="font-medium">
              {group.tournament?.name || 'Unknown'}
            </Text>
          </div>
        </div>

        {actionError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/50">
            <Text className="text-sm text-red-800 dark:text-red-200">
              {actionError}
            </Text>
          </div>
        )}

        {user && !isUserInGroup && (
          <Button
            color="zinc"
            disabled={isJoining}
            onClick={handleJoinGroup}
            className="w-full"
          >
            {isJoining ? 'Joining...' : 'Join Group'}
          </Button>
        )}

        {user && isUserInGroup && (
          <Button color="zinc" href={`/groups/${group.id}`} className="w-full">
            Go to group
          </Button>
        )}

        {!user && (
          <Button color="zinc" href="/signup" className="w-full">
            Join Tourny
          </Button>
        )}
      </div>

      <div className="text-center">
        <Text className="text-sm text-zinc-500 dark:text-zinc-400">
          By joining this group, you'll be able to participate in predictions
          and compete with other members.
        </Text>
      </div>
    </div>
  )
}
