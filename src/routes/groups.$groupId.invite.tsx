import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import {
  getGroup,
  getGroupInviteCode,
  getGroupPlayers,
  getCurrentUser,
} from '@/lib/queries'
import { createGroupInviteCode, updateGroupInviteCode } from '@/lib/mutations'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, Label, Description } from '@/components/ui/fieldset'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'
import {
  ArrowLeftIcon,
  ClipboardIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

export const Route = createFileRoute('/groups/$groupId/invite')({
  loader: async ({ params }) => {
    const groupId = parseInt(params.groupId)

    const [group, user, inviteCode, members] = await Promise.all([
      getGroup({ data: { groupId } }),
      getCurrentUser(),
      getGroupInviteCode({ data: { groupId } }),
      getGroupPlayers({ data: { groupId } }),
    ])

    if (!group) {
      throw new Error('Group not found')
    }

    // Check if user is admin
    if (group.adminId !== user.id) {
      throw new Error('Unauthorized')
    }

    return {
      data: {
        group,
        inviteCode,
        memberCount: members.length,
      },
      error: null,
    }
  },
  component: GroupInvites,
})

function GroupInvites() {
  const { data, error } = Route.useLoaderData()

  const [copied, setCopied] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [inviteCode, setInviteCode] = useState(data?.inviteCode)

  if (error || !data || !data.group) {
    return <div>{error}</div>
  }

  const { group, memberCount } = data

  const copyToClipboard = async () => {
    if (inviteCode?.code) {
      await navigator.clipboard.writeText(
        `${window.location.origin}/groups/join/${inviteCode.code}`,
      )
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCreateCode = async () => {
    setIsCreating(true)
    try {
      const newCode = await createGroupInviteCode({ data: { groupId: group.id } })
      setInviteCode(newCode)
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateCode = async () => {
    setIsUpdating(true)
    try {
      const newCode = await updateGroupInviteCode({ data: { groupId: group.id } })
      setInviteCode(newCode)
    } finally {
      setIsUpdating(false)
    }
  }

  const inviteUrl = inviteCode?.code
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/groups/join/${inviteCode.code}`
    : null

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <div className="mb-6">
        <Button plain href={`/groups/${group.id}`} className="mb-4">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Group
        </Button>

        <Heading level={1} className="mb-2">
          Invite Members
        </Heading>
        <Text className="text-zinc-600 dark:text-zinc-400">
          Manage invite codes for {group.name}
        </Text>
      </div>

      <div className="space-y-6">
        {!inviteCode ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
            <Heading level={2} className="mb-4">
              Create Invite Code
            </Heading>
            <Text className="mb-4 text-zinc-600 dark:text-zinc-400">
              Generate an invite code that others can use to join your group.
            </Text>
            <Button color="zinc" disabled={isCreating} onClick={handleCreateCode}>
              {isCreating ? 'Creating...' : 'Create Invite Code'}
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
            <Heading level={2} className="mb-4">
              Current Invite Code
            </Heading>

            <div className="space-y-4">
              <Field>
                <Label>Invite Link</Label>
                <Description>
                  Share this link with people you want to invite to the group.
                </Description>
                <div className="flex gap-2">
                  <Input value={inviteUrl || ''} readOnly className="flex-1" />
                  <Button plain onClick={copyToClipboard} className="px-3">
                    <ClipboardIcon className="h-4 w-4" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </Field>

              <Field>
                <Label>Invite Code</Label>
                <Description>
                  The raw invite code (also works in the URL).
                </Description>
                <div className="flex gap-2">
                  <Input
                    value={inviteCode.code}
                    readOnly
                    className="flex-1 font-mono"
                  />
                  <Button
                    plain
                    onClick={() => navigator.clipboard.writeText(inviteCode.code)}
                    className="px-3"
                  >
                    <ClipboardIcon className="h-4 w-4" />
                  </Button>
                </div>
              </Field>

              <div className="flex gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-700">
                <Button
                  plain
                  disabled={isUpdating}
                  onClick={handleUpdateCode}
                  className="w-full"
                >
                  <ArrowPathIcon className="mr-2 h-4 w-4" />
                  {isUpdating ? 'Updating...' : 'Generate New Code'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/50">
          <Heading level={3} className="mb-2 text-blue-900 dark:text-blue-100">
            Group Information
          </Heading>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <Text className="text-blue-700 dark:text-blue-300">
                Group Name:
              </Text>
              <Text className="font-medium text-blue-900 dark:text-blue-100">
                {group.name}
              </Text>
            </div>
            <div className="flex justify-between">
              <Text className="text-blue-700 dark:text-blue-300">Members:</Text>
              <Text className="font-medium text-blue-900 dark:text-blue-100">
                {memberCount}/500
              </Text>
            </div>
            <div className="flex justify-between">
              <Text className="text-blue-700 dark:text-blue-300">
                Tournament:
              </Text>
              <Text className="font-medium text-blue-900 dark:text-blue-100">
                {group.tournament?.name || 'Unknown'}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
