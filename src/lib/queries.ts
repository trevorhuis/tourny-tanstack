import { and, asc, eq, notExists, inArray, sql } from 'drizzle-orm'
import { db } from '../index'
import * as schema from './schema'
import { Round } from './types'

export async function getLatestTournament() {
  return await db.query.tournament.findFirst({
    orderBy: [asc(schema.tournament.id)],
  })
}

export async function getActiveTournamentTeams(tournamentId: number) {
  return await db.query.tournamentTeam.findMany({
    where: and(
      eq(schema.tournamentTeam.tournamentId, tournamentId),
      eq(schema.tournamentTeam.status, 'active'),
    ),
  })
}

export async function getGroupsForUser(userId: string, tournamentId: number) {
  return await db
    .select({ group: schema.group })
    .from(schema.group)
    .leftJoin(
      schema.groupMember,
      eq(schema.group.id, schema.groupMember.groupId),
    )
    .where(
      and(
        eq(schema.group.tournamentId, tournamentId),
        eq(schema.groupMember.userId, userId),
      ),
    )
}

export async function getAllGroupsForUser(userId: string) {
  return await db
    .select({
      id: schema.group.id,
      name: schema.group.name,
      tournamentId: schema.group.tournamentId,
      adminId: schema.group.adminId,
      createdAt: schema.group.createdAt,
    })
    .from(schema.group)
    .innerJoin(
      schema.groupMember,
      and(
        eq(schema.group.id, schema.groupMember.groupId),
        eq(schema.groupMember.userId, userId),
      ),
    )
    .orderBy(schema.group.createdAt)
}

export async function getWinnerPredictionsForUser(
  userId: string,
  tournamentId: number,
) {
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
        eq(schema.winnerPrediction.userId, userId),
        eq(schema.winnerPrediction.tournamentId, tournamentId),
      ),
    )
    .orderBy(schema.winnerPrediction.round)
}

export async function getAllUserMatchPredictions(
  userId: string,
  tournamentId: number,
) {
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
        eq(schema.matchPrediction.userId, userId),
        eq(schema.match.tournamentId, tournamentId),
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
}

export async function getGroup(groupId: number) {
  return await db.query.group.findFirst({
    where: eq(schema.group.id, groupId),
    with: {
      tournament: true,
    },
  })
}

export async function getGroupPlayers(groupId: number) {
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
    .where(eq(schema.groupMember.groupId, groupId))
}

export async function getGroupDetails(groupId: number) {
  const group = await db.query.group.findFirst({
    where: eq(schema.group.id, groupId),
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
      invite: true,
    },
  })

  if (!group) {
    return null
  }

  return {
    ...group,
    members: group.members.map((m) => m.user),
  }
}

export async function getTournamentMatchesByRound(
  tournamentId: number,
  round: Round,
) {
  return await db.query.match.findMany({
    where: and(
      eq(schema.match.round, round),
      eq(schema.match.tournamentId, tournamentId),
    ),
  })
}

export async function getDashboardStats() {
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
}

export async function getAllTournaments() {
  return await db.query.tournament.findMany({
    orderBy: [asc(schema.tournament.id)],
  })
}

export async function getTournamentGroups(tournamentId: number) {
  return await db.query.tournamentGroup.findMany({
    where: eq(schema.tournamentGroup.tournamentId, tournamentId),
  })
}

export async function getTournamentTeams(tournamentId: number) {
  return await db.query.tournamentTeam.findMany({
    where: eq(schema.tournamentTeam.tournamentId, tournamentId),
  })
}

export async function getTournamentMatches(tournamentId: number) {
  return await db.query.match.findMany({
    where: eq(schema.match.tournamentId, tournamentId),
    orderBy: [asc(schema.match.matchDatetime)],
  })
}
