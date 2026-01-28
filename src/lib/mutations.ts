import { eq, and } from 'drizzle-orm'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '@/db/index'
import * as schema from '@/db/schema'
import { authMiddleware } from '@/middleware/auth-middleware'
import { getUserFromHeaders } from './utils'

import {
  groupInsertSchema,
  groupMemberInsertSchema,
  matchPredictionInsertSchema,
  winnerPredictionInsertSchema,
  userInsertSchema,
  tournamentInsertSchema,
  tournamentTeamInsertSchema,
  tournamentGroupInsertSchema,
  matchInsertSchema,
} from '../lib/types'

// Generate a random 10-character alphanumeric code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const createGroup = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(groupInsertSchema.pick({ tournamentId: true, name: true }))
  .handler(async ({ data }) => {
    const user = await getUserFromHeaders()

    if (!user) {
      throw new Error('User not found')
    }

    const [insertedGroup] = await db
      .insert(schema.group)
      .values({
        ...data,
        adminId: user.id,
      })
      .returning({ insertedId: schema.group.id })

    await db
      .insert(schema.groupMember)
      .values({ groupId: insertedGroup.insertedId, userId: user.id })

    return insertedGroup.insertedId
  })

export const createMatchPrediction = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(matchPredictionInsertSchema)
  .handler(async ({ data }) => {
    await db.insert(schema.matchPrediction).values({
      userId: data.userId,
      matchId: data.matchId,
      teamAScore: data.teamAScore,
      teamBScore: data.teamBScore,
      penaltyResult: null,
    })
  })

export const createWinnerPrediction = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(winnerPredictionInsertSchema)
  .handler(async ({ data }) => {
    await db.insert(schema.winnerPrediction).values({
      userId: data.userId,
      tournamentId: data.tournamentId,
      round: data.round,
      tournamentTeamId: data.tournamentTeamId,
    })
  })

export const removePlayerFromGroup = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(groupMemberInsertSchema.pick({ groupId: true, userId: true }))
  .handler(async ({ data }) => {
    await db
      .delete(schema.groupMember)
      .where(
        and(
          eq(schema.groupMember.groupId, data.groupId),
          eq(schema.groupMember.userId, data.userId),
        ),
      )
  })

export const deleteGroup = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ groupId: z.number() }))
  .handler(async ({ data }) => {
    await db.delete(schema.group).where(eq(schema.group.id, data.groupId))
  })

export const createGroupInviteCode = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ groupId: z.number() }))
  .handler(async ({ data }) => {
    const code = generateInviteCode()

    const [inviteCode] = await db
      .insert(schema.groupInvite)
      .values({
        groupId: data.groupId,
        code,
      })
      .returning()

    return inviteCode
  })

export const updateGroupInviteCode = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ groupId: z.number() }))
  .handler(async ({ data }) => {
    const newCode = generateInviteCode()

    const [updatedCode] = await db
      .update(schema.groupInvite)
      .set({ code: newCode })
      .where(eq(schema.groupInvite.groupId, data.groupId))
      .returning()

    return updatedCode
  })

export const joinGroupWithInviteCode = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ code: z.string() }))
  .handler(async ({ data }) => {
    const user = await getUserFromHeaders()

    if (!user) {
      throw new Error('User not found')
    }

    const inviteCodeData = await db.query.groupInvite.findFirst({
      where: eq(schema.groupInvite.code, data.code),
      with: {
        group: {
          with: {
            members: true,
          },
        },
      },
    })

    if (!inviteCodeData) {
      throw new Error('Invalid invite code')
    }

    const groupData = inviteCodeData.group

    const existingMember = groupData.members.find(
      (member) => member.userId === user.id,
    )
    if (existingMember) {
      throw new Error('You are already a member of this group')
    }

    if (groupData.members.length >= 500) {
      throw new Error('Group has reached maximum capacity (500 members)')
    }

    await db.insert(schema.groupMember).values({
      groupId: groupData.id,
      userId: user.id,
    })

    return groupData
  })

export const leaveGroup = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ groupId: z.number() }))
  .handler(async ({ data }) => {
    const user = await getUserFromHeaders()

    if (!user) {
      throw new Error('User not found')
    }

    await db
      .delete(schema.groupMember)
      .where(
        and(
          eq(schema.groupMember.groupId, data.groupId),
          eq(schema.groupMember.userId, user.id),
        ),
      )
  })

export const updateGroup = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({ groupId: z.number(), updates: groupInsertSchema.partial() }),
  )
  .handler(async ({ data }) => {
    await db
      .update(schema.group)
      .set(data.updates)
      .where(eq(schema.group.id, data.groupId))
  })

export const updateMatchPrediction = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      predictionId: z.number(),
      updates: matchPredictionInsertSchema.partial(),
    }),
  )
  .handler(async ({ data }) => {
    await db
      .update(schema.matchPrediction)
      .set(data.updates)
      .where(eq(schema.matchPrediction.id, data.predictionId))
  })

export const updateWinnerPrediction = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      predictionId: z.number(),
      updates: winnerPredictionInsertSchema.partial(),
    }),
  )
  .handler(async ({ data }) => {
    await db
      .update(schema.winnerPrediction)
      .set(data.updates)
      .where(eq(schema.winnerPrediction.id, data.predictionId))
  })

export const updateUserProfile = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ updates: userInsertSchema.partial() }))
  .handler(async ({ data }) => {
    const user = await getUserFromHeaders()

    if (!user) {
      throw new Error('User not found')
    }

    await db
      .update(schema.user)
      .set(data.updates)
      .where(eq(schema.user.id, user.id))
  })

export const changePassword = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z
        .string()
        .min(6, 'New password must be at least 6 characters'),
    }),
  )
  .handler(async ({ data }) => {
    const { auth } = await import('@/lib/auth')
    const { getRequestHeaders } = await import('@tanstack/react-start/server')

    const headers = getRequestHeaders()

    const result = await auth.api.changePassword({
      body: {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      headers,
    })

    if (!result) {
      throw new Error(
        'Failed to change password. Please check your current password.',
      )
    }

    return { success: true }
  })

export const createTournament = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(tournamentInsertSchema)
  .handler(async ({ data }) => {
    const [tournament] = await db
      .insert(schema.tournament)
      .values(data)
      .returning({ id: schema.tournament.id })
    return tournament.id
  })

export const createTournamentGroup = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(tournamentGroupInsertSchema.omit({ id: true }))
  .handler(async ({ data }) => {
    const [group] = await db
      .insert(schema.tournamentGroup)
      .values(data)
      .returning({ id: schema.tournamentGroup.id })
    return group.id
  })

export const updateTournamentGroup = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({ id: z.number(), data: tournamentGroupInsertSchema.partial() }),
  )
  .handler(async ({ data }) => {
    await db
      .update(schema.tournamentGroup)
      .set(data.data)
      .where(eq(schema.tournamentGroup.id, data.id))
  })

export const createTournamentTeam = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(tournamentTeamInsertSchema)
  .handler(async ({ data }) => {
    const [team] = await db
      .insert(schema.tournamentTeam)
      .values(data)
      .returning({ id: schema.tournamentTeam.id })
    return team.id
  })

export const updateTournamentTeam = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({ id: z.number(), data: tournamentTeamInsertSchema.partial() }),
  )
  .handler(async ({ data }) => {
    await db
      .update(schema.tournamentTeam)
      .set(data.data)
      .where(eq(schema.tournamentTeam.id, data.id))
  })

export const createMatch = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(matchInsertSchema)
  .handler(async ({ data }) => {
    const [match] = await db
      .insert(schema.match)
      .values(data)
      .returning({ id: schema.match.id })
    return match.id
  })

export const updateMatch = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({ id: z.number(), data: matchInsertSchema.partial() }),
  )
  .handler(async ({ data }) => {
    await db
      .update(schema.match)
      .set(data.data)
      .where(eq(schema.match.id, data.id))
  })
