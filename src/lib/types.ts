import { createSelectSchema, createInsertSchema } from 'drizzle-zod'
import type { z } from 'zod'

import * as schema from '@/db/schema'

// User schemas and types
export const userSelectSchema = createSelectSchema(schema.user)
export const userInsertSchema = createInsertSchema(schema.user)
export type User = z.infer<typeof userSelectSchema>
export type InsertUser = z.infer<typeof userInsertSchema>

// Session schemas and types
export const sessionSelectSchema = createSelectSchema(schema.session)
export const sessionInsertSchema = createInsertSchema(schema.session)
export type Session = z.infer<typeof sessionSelectSchema>
export type InsertSession = z.infer<typeof sessionInsertSchema>

// Account schemas and types
export const accountSelectSchema = createSelectSchema(schema.account)
export const accountInsertSchema = createInsertSchema(schema.account)
export type Account = z.infer<typeof accountSelectSchema>
export type InsertAccount = z.infer<typeof accountInsertSchema>

// Verification schemas and types
export const verificationSelectSchema = createSelectSchema(schema.verification)
export const verificationInsertSchema = createInsertSchema(schema.verification)
export type Verification = z.infer<typeof verificationSelectSchema>
export type InsertVerification = z.infer<typeof verificationInsertSchema>

// Tournament schemas and types
export const tournamentSelectSchema = createSelectSchema(schema.tournament)
export const tournamentInsertSchema = createInsertSchema(schema.tournament)
export type Tournament = z.infer<typeof tournamentSelectSchema>
export type InsertTournament = z.infer<typeof tournamentInsertSchema>

// TournamentTeam schemas and types
export const tournamentTeamSelectSchema = createSelectSchema(
  schema.tournamentTeam,
)
export const tournamentTeamInsertSchema = createInsertSchema(
  schema.tournamentTeam,
)
export type TournamentTeam = z.infer<typeof tournamentTeamSelectSchema>
export type InsertTournamentTeam = z.infer<typeof tournamentTeamInsertSchema>

// Group schemas and types
export const groupSelectSchema = createSelectSchema(schema.group)
export const groupInsertSchema = createInsertSchema(schema.group)
export type Group = z.infer<typeof groupSelectSchema>
export type InsertGroup = z.infer<typeof groupInsertSchema>

// GroupInvite schemas and types
export const groupInviteSelectSchema = createSelectSchema(schema.groupInvite)
export const groupInviteInsertSchema = createInsertSchema(schema.groupInvite)
export type GroupInvite = z.infer<typeof groupInviteSelectSchema>
export type InsertGroupInvite = z.infer<typeof groupInviteInsertSchema>

// GroupMember schemas and types
export const groupMemberSelectSchema = createSelectSchema(schema.groupMember)
export const groupMemberInsertSchema = createInsertSchema(schema.groupMember)
export type GroupMember = z.infer<typeof groupMemberSelectSchema>
export type InsertGroupMember = z.infer<typeof groupMemberInsertSchema>

// Match schemas and types
export const matchSelectSchema = createSelectSchema(schema.match)
export const matchInsertSchema = createInsertSchema(schema.match)
export type Match = z.infer<typeof matchSelectSchema>
export type InsertMatch = z.infer<typeof matchInsertSchema>

// MatchPrediction schemas and types
export const matchPredictionSelectSchema = createSelectSchema(
  schema.matchPrediction,
)
export const matchPredictionInsertSchema = createInsertSchema(
  schema.matchPrediction,
)
export type MatchPrediction = z.infer<typeof matchPredictionSelectSchema>
export type InsertMatchPrediction = z.infer<typeof matchPredictionInsertSchema>

// WinnerPrediction schemas and types
export const winnerPredictionSelectSchema = createSelectSchema(
  schema.winnerPrediction,
)
export const winnerPredictionInsertSchema = createInsertSchema(
  schema.winnerPrediction,
)
export type WinnerPrediction = z.infer<typeof winnerPredictionSelectSchema>
export type InsertWinnerPrediction = z.infer<
  typeof winnerPredictionInsertSchema
>

// TournamentGroup schemas and types
export const tournamentGroupSelectSchema = createSelectSchema(
  schema.tournamentGroup,
)
export const tournamentGroupInsertSchema = createInsertSchema(
  schema.tournamentGroup,
)
export type TournamentGroup = z.infer<typeof tournamentGroupSelectSchema>
export type InsertTournamentGroup = z.infer<typeof tournamentGroupInsertSchema>

// Enum types
export type TournamentStatus =
  (typeof schema.tournamentStatusEnum.enumValues)[number]
export type MatchStatus = (typeof schema.matchStatusEnum.enumValues)[number]
export type Round = (typeof schema.roundEnum.enumValues)[number]
export type TeamStatus = (typeof schema.teamStatusEnum.enumValues)[number]
