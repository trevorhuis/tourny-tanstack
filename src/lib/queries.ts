import { and, asc, eq, inArray } from 'drizzle-orm'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '@/db/index'
import * as schema from '@/db/schema'
import { authMiddleware } from '@/middleware/auth-middleware'
import { roundEnum } from '@/db/schema'
import { getUserFromHeaders } from './utils'

export const getLatestTournament = createServerFn({ method: 'GET' }).handler(
  async () => {
    return await db.query.tournament.findFirst({
      orderBy: [asc(schema.tournament.id)],
    })
  },
)

export const getActiveTournamentTeams = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ tournamentId: z.number() }))
  .handler(async ({ data }) => {
    return await db.query.tournamentTeam.findMany({
      where: and(
        eq(schema.tournamentTeam.tournamentId, data.tournamentId),
        eq(schema.tournamentTeam.status, 'active'),
      ),
    })
  })

export const getGroupsForUser = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ tournamentId: z.number() }))
  .handler(async ({ data }) => {
    const user = await getUserFromHeaders()

    if (!user) {
      throw new Error('User not found')
    }

    return await db
      .select({ group: schema.group })
      .from(schema.group)
      .leftJoin(
        schema.groupMember,
        eq(schema.group.id, schema.groupMember.groupId),
      )
      .where(
        and(
          eq(schema.group.tournamentId, data.tournamentId),
          eq(schema.groupMember.userId, user.id),
        ),
      )
  })

export const getAllGroupsForUser = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async () => {
    const user = await getUserFromHeaders()

    if (!user) {
      throw new Error('User not found')
    }

    return await db
      .select({
        id: schema.group.id,
        name: schema.group.name,
        tournamentId: schema.group.tournamentId,
        adminId: schema.group.adminId,
      })
      .from(schema.group)
      .innerJoin(
        schema.groupMember,
        and(
          eq(schema.group.id, schema.groupMember.groupId),
          eq(schema.groupMember.userId, user.id),
        ),
      )
  })

export const getWinnerPredictionsForUser = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ tournamentId: z.number() }))
  .handler(async ({ data }) => {
    const user = await getUserFromHeaders()

    if (!user) {
      throw new Error('User not found')
    }

    return await db
      .select({
        id: schema.winnerPrediction.id,
        round: schema.winnerPrediction.round,
        teamName: schema.tournamentTeam.name,
        teamFlag: schema.tournamentTeam.flag,
      })
      .from(schema.winnerPrediction)
      .innerJoin(
        schema.tournamentTeam,
        eq(schema.winnerPrediction.tournamentTeamId, schema.tournamentTeam.id),
      )
      .where(
        and(
          eq(schema.winnerPrediction.userId, user.id),
          eq(schema.winnerPrediction.tournamentId, data.tournamentId),
        ),
      )
      .orderBy(schema.winnerPrediction.round)
  })

export const getAllUserMatchPredictions = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ tournamentId: z.number() }))
  .handler(async ({ data }) => {
    const user = await getUserFromHeaders()

    if (!user) {
      throw new Error('User not found')
    }

    const predictions = await db
      .select({
        id: schema.matchPrediction.id,
        matchId: schema.matchPrediction.matchId,
        teamAScore: schema.matchPrediction.teamAScore,
        teamBScore: schema.matchPrediction.teamBScore,
        matchDate: schema.match.matchDatetime,
        teamAId: schema.match.teamAId,
        teamBId: schema.match.teamBId,
        stadium: schema.match.stadium,
        round: schema.match.round,
      })
      .from(schema.matchPrediction)
      .innerJoin(
        schema.match,
        eq(schema.matchPrediction.matchId, schema.match.id),
      )
      .where(
        and(
          eq(schema.matchPrediction.userId, user.id),
          eq(schema.match.tournamentId, data.tournamentId),
        ),
      )
      .orderBy(schema.match.matchDatetime)

    const teamIds = new Set([
      ...predictions.map((p) => p.teamAId),
      ...predictions.map((p) => p.teamBId),
    ])

    const teams = await db
      .select({
        id: schema.tournamentTeam.id,
        name: schema.tournamentTeam.name,
        flag: schema.tournamentTeam.flag,
      })
      .from(schema.tournamentTeam)
      .where(inArray(schema.tournamentTeam.id, Array.from(teamIds)))

    const teamMap = new Map(teams.map((t) => [t.id, t]))

    return predictions.map((prediction) => ({
      ...prediction,
      homeTeamName: teamMap.get(prediction.teamAId)?.name || '',
      homeTeamFlag: teamMap.get(prediction.teamAId)?.flag || '',
      awayTeamName: teamMap.get(prediction.teamBId)?.name || '',
      awayTeamFlag: teamMap.get(prediction.teamBId)?.flag || '',
    }))
  })

export const getGroup = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ groupId: z.number() }))
  .handler(async ({ data }) => {
    return await db.query.group.findFirst({
      where: eq(schema.group.id, data.groupId),
      with: {
        tournament: true,
      },
    })
  })

export const getGroupPlayers = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ groupId: z.number() }))
  .handler(async ({ data }) => {
    return await db
      .select({
        id: schema.groupMember.id,
        userId: schema.groupMember.userId,
        groupId: schema.groupMember.groupId,
        username: schema.user.name,
        score: schema.user.id, // Placeholder - will be replaced with actual score calculation
      })
      .from(schema.groupMember)
      .innerJoin(schema.user, eq(schema.groupMember.userId, schema.user.id))
      .where(eq(schema.groupMember.groupId, data.groupId))
  })

export const getGroupPlayersWithScores = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ groupId: z.number(), tournamentId: z.number() }))
  .handler(async ({ data }) => {
    const { sql } = await import('drizzle-orm')

    const players = await db
      .select({
        id: schema.groupMember.id,
        userId: schema.groupMember.userId,
        groupId: schema.groupMember.groupId,
        username: schema.user.name,
        score: sql<number>`COALESCE(${schema.tournamentScore.userScore}, 0)`.as(
          'score',
        ),
      })
      .from(schema.groupMember)
      .innerJoin(schema.user, eq(schema.groupMember.userId, schema.user.id))
      .leftJoin(
        schema.tournamentScore,
        and(
          eq(schema.tournamentScore.userId, schema.groupMember.userId),
          eq(schema.tournamentScore.tournamentId, data.tournamentId),
        ),
      )
      .where(eq(schema.groupMember.groupId, data.groupId))

    return players
  })

export const getGroupInviteCode = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ groupId: z.number() }))
  .handler(async ({ data }) => {
    return await db.query.groupInvite.findFirst({
      where: eq(schema.groupInvite.groupId, data.groupId),
    })
  })

export const getGroupByInviteCode = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ code: z.string() }))
  .handler(async ({ data }) => {
    const inviteCodeData = await db.query.groupInvite.findFirst({
      where: eq(schema.groupInvite.code, data.code),
      with: {
        group: {
          with: {
            tournament: true,
            admin: true,
            members: true,
          },
        },
      },
    })

    if (!inviteCodeData) {
      return null
    }

    return inviteCodeData
  })

export const getGroupDetails = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ groupId: z.number() }))
  .handler(async ({ data }) => {
    const group = await db.query.group.findFirst({
      where: eq(schema.group.id, data.groupId),
      with: {
        members: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        inviteCodes: true,
      },
    })

    if (!group) {
      return null
    }

    return {
      ...group,
      members: group.members.map((m) => m.user),
    }
  })

export const getTournamentMatchesByRound = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      tournamentId: z.number(),
      round: z.enum(roundEnum.enumValues),
    }),
  )
  .handler(async ({ data }) => {
    return await db.query.match.findMany({
      where: and(
        eq(schema.match.round, data.round),
        eq(schema.match.tournamentId, data.tournamentId),
      ),
    })
  })

export const getDashboardStats = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async () => {
    const userCount = await db.$count(schema.user)
    const tournamentCount = await db.$count(schema.tournament)
    const groupCount = await db.$count(schema.group)
    const matchPredictionCount = await db.$count(schema.matchPrediction)

    return {
      userCount,
      tournamentCount,
      groupCount,
      matchPredictionCount,
    }
  })

export const getAllTournaments = createServerFn({ method: 'GET' }).handler(
  async () => {
    return await db.query.tournament.findMany({
      orderBy: [asc(schema.tournament.id)],
    })
  },
)

export const getTournamentGroups = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ tournamentId: z.number() }))
  .handler(async ({ data }) => {
    return await db.query.tournamentGroup.findMany({
      where: eq(schema.tournamentGroup.tournamentId, data.tournamentId),
    })
  })

export const getTournamentTeams = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ tournamentId: z.number() }))
  .handler(async ({ data }) => {
    return await db.query.tournamentTeam.findMany({
      where: eq(schema.tournamentTeam.tournamentId, data.tournamentId),
    })
  })

export const getTournamentMatches = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ tournamentId: z.number() }))
  .handler(async ({ data }) => {
    return await db.query.match.findMany({
      where: eq(schema.match.tournamentId, data.tournamentId),
      orderBy: [asc(schema.match.matchDatetime)],
    })
  })

export const getCurrentUser = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async () => {
    const user = await getUserFromHeaders()

    if (!user) {
      throw new Error('User not found')
    }

    return user
  })

export const getGlobalLeaderboard = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({ tournamentId: z.number(), limit: z.number().optional() }),
  )
  .handler(async ({ data }) => {
    const { desc } = await import('drizzle-orm')
    const limit = data.limit ?? 50

    return await db
      .select({
        id: schema.user.id,
        name: schema.user.name,
        image: schema.user.image,
        score: schema.tournamentScore.userScore,
      })
      .from(schema.tournamentScore)
      .innerJoin(schema.user, eq(schema.tournamentScore.userId, schema.user.id))
      .where(eq(schema.tournamentScore.tournamentId, data.tournamentId))
      .orderBy(desc(schema.tournamentScore.userScore))
      .limit(limit)
  })

export const getUserLeaderboardScore = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ tournamentId: z.number() }))
  .handler(async ({ data }) => {
    const user = await getUserFromHeaders()

    if (!user) {
      throw new Error('User not found')
    }

    const result = await db
      .select({ score: schema.tournamentScore.userScore })
      .from(schema.tournamentScore)
      .where(
        and(
          eq(schema.tournamentScore.userId, user.id),
          eq(schema.tournamentScore.tournamentId, data.tournamentId),
        ),
      )
      .limit(1)

    return result[0]?.score ?? null
  })
