import { eq, and } from 'drizzle-orm'
import { db } from '../index'
import * as schema from './schema'

import type {
  InsertGroup,
  InsertGroupMember,
  InsertMatchPrediction,
  InsertWinnerPrediction,
  InsertUser,
  InsertTournament,
  InsertTournamentTeam,
  InsertMatch,
} from '../lib/types'

export async function createGroup(newGroup: InsertGroup) {
  let [insertedGroup] = await db
    .insert(schema.group)
    .values(newGroup)
    .returning({ insertedId: schema.group.id })

  await db
    .insert(schema.groupMember)
    .values({ groupId: insertedGroup.insertedId, userId: newGroup.adminId })

  return insertedGroup.insertedId
}

export async function createMatchPrediction(
  newMatchPrediction: InsertMatchPrediction,
) {
  await db.insert(schema.matchPrediction).values({
    userId: newMatchPrediction.userId,
    matchId: newMatchPrediction.matchId,
    teamAScore: newMatchPrediction.teamAScore,
    teamBScore: newMatchPrediction.teamBScore,
    penaltyResult: null, // Assuming no penalties for now
  })
}

export async function createWinnerPrediction(
  newWinnerPrediction: InsertWinnerPrediction,
) {
  await db.insert(schema.winnerPrediction).values({
    userId: newWinnerPrediction.userId,
    tournamentId: newWinnerPrediction.tournamentId,
    round: newWinnerPrediction.round, // Assuming round is valid enum
    tournamentTeamId: newWinnerPrediction.tournamentTeamId,
  })
}

export async function removePlayerFromGroup(
  groupMemberInsert: InsertGroupMember,
) {
  await db
    .delete(schema.groupMember)
    .where(
      and(
        eq(schema.groupMember.groupId, groupMemberInsert.groupId),
        eq(schema.groupMember.userId, groupMemberInsert.userId),
      ),
    )
}

export async function deleteGroup(groupId: number) {
  await db.delete(schema.group).where(eq(schema.group.id, groupId))
}

// Generate a random 10-character alphanumeric code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function createGroupInviteCode(groupId: number) {
  const code = generateInviteCode()

  const [inviteCode] = await db
    .insert(schema.groupInvite)
    .values({
      groupId,
      code,
    })
    .returning()

  return inviteCode
}

export async function updateGroupInviteCode(groupId: number) {
  const newCode = generateInviteCode()

  const [updatedCode] = await db
    .update(schema.groupInvite)
    .set({ code: newCode })
    .where(eq(schema.groupInvite.groupId, groupId))
    .returning()

  return updatedCode
}

export async function joinGroupWithInviteCode(userId: string, code: string) {
  // Find the group by invite code
  const inviteCodeData = await db.query.groupInvite.findFirst({
    where: eq(schema.groupInvite.code, code),
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

  // Check if user is already a member
  const existingMember = groupData.members.find(
    (member) => member.userId === userId,
  )
  if (existingMember) {
    throw new Error('You are already a member of this group')
  }

  // Check group size limit (500 members)
  if (groupData.members.length >= 500) {
    throw new Error('Group has reached maximum capacity (500 members)')
  }

  // Add user to group
  await db.insert(schema.groupMember).values({
    groupId: groupData.id,
    userId,
  })

  return groupData
}

export async function leaveGroup(userId: string, groupId: number) {
  await db
    .delete(schema.groupMember)
    .where(
      and(
        eq(schema.groupMember.groupId, groupId),
        eq(schema.groupMember.userId, userId),
      ),
    )
}

export async function updateGroup(
  groupId: number,
  updates: Partial<InsertGroup>,
) {
  await db.update(schema.group).set(updates).where(eq(schema.group.id, groupId))
}

export async function updateMatchPrediction(
  predictionId: number,
  updates: Partial<InsertMatchPrediction>,
) {
  await db
    .update(schema.matchPrediction)
    .set(updates)
    .where(eq(schema.matchPrediction.id, predictionId))
}

export async function updateWinnerPrediction(
  predictionId: number,
  updates: Partial<InsertWinnerPrediction>,
) {
  await db
    .update(schema.winnerPrediction)
    .set(updates)
    .where(eq(schema.winnerPrediction.id, predictionId))
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<InsertUser>,
) {
  await db.update(schema.user).set(updates).where(eq(schema.user.id, userId))
}

export async function createTournament(data: InsertTournament) {
  const [tournament] = await db
    .insert(schema.tournament)
    .values(data)
    .returning({ id: schema.tournament.id })
  return tournament.id
}

export async function createTournamentGroup(
  data: Omit<typeof schema.tournamentGroup.$inferInsert, 'id'>,
) {
  const [group] = await db
    .insert(schema.tournamentGroup)
    .values(data)
    .returning({ id: schema.tournamentGroup.id })
  return group.id
}

export async function updateTournamentGroup(
  id: number,
  data: Partial<typeof schema.tournamentGroup.$inferInsert>,
) {
  await db
    .update(schema.tournamentGroup)
    .set(data)
    .where(eq(schema.tournamentGroup.id, id))
}

export async function createTournamentTeam(data: InsertTournamentTeam) {
  const [team] = await db
    .insert(schema.tournamentTeam)
    .values(data)
    .returning({ id: schema.tournamentTeam.id })
  return team.id
}

export async function updateTournamentTeam(
  id: number,
  data: Partial<InsertTournamentTeam>,
) {
  await db
    .update(schema.tournamentTeam)
    .set(data)
    .where(eq(schema.tournamentTeam.id, id))
}

export async function createMatch(data: InsertMatch) {
  const [match] = await db
    .insert(schema.match)
    .values(data)
    .returning({ id: schema.match.id })
  return match.id
}

export async function updateMatch(id: number, data: Partial<InsertMatch>) {
  await db.update(schema.match).set(data).where(eq(schema.match.id, id))
}
