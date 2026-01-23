import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text('role').default('user'),
  country: text('country'),
  countryFlag: text('country_flag'),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

const status = ['upcoming', 'ongoing', 'completed'] as const
export const tournamentStatusEnum = pgEnum('tournamentStatus', status)
export const matchStatusEnum = pgEnum('matchStatus', status)
export const roundEnum = pgEnum('round', [
  'group',
  'round_of_32',
  'round_of_16',
  'quarter_final',
  'semi_final',
  'third_place',
  'final',
])
export const teamStatusEnum = pgEnum('status', [
  'active',
  'eliminated',
  'winner',
])

export const tournament = pgTable(
  'tournament',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    location: text('location').notNull(),
    status: tournamentStatusEnum('tournament_status').notNull(),
    startDate: timestamp('start_date', { mode: 'date' }).notNull(),
    endDate: timestamp('end_date', { mode: 'date' }).notNull(),
    currentStage: roundEnum('current_stage').notNull().default('group'),
  },
  (t) => [unique().on(t.name, t.startDate, t.endDate)],
)

export const tournamentGroup = pgTable(
  'tournament_group',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    tournamentId: integer('tournament_id')
      .notNull()
      .references(() => tournament.id),
  },
  (t) => [unique().on(t.tournamentId, t.name)],
)

export const tournamentTeam = pgTable('tournament_team', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  tournamentId: integer('tournament_id')
    .notNull()
    .references(() => tournament.id),
  flag: text('flag').notNull(),
  tournamentGroupId: integer('tournament_group_id')
    .notNull()
    .references(() => tournamentGroup.id),
  groupPoints: integer('group_points'),
  status: teamStatusEnum('status').notNull().default('active'),
})

export const group = pgTable('group', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  adminId: text('admin_id')
    .notNull()
    .references(() => user.id),
  tournamentId: integer('tournament_id')
    .notNull()
    .references(() => tournament.id),
})

export const groupInvite = pgTable('group_invite', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').notNull(),
  code: varchar('code', { length: 10 }).notNull(),
})

export const groupMember = pgTable(
  'group_member',
  {
    id: serial('id').primaryKey(),
    groupId: integer('group_id')
      .notNull()
      .references(() => group.id),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
  },
  (t) => [unique().on(t.groupId, t.userId)],
)

export const match = pgTable('match', {
  id: serial('id').primaryKey(),
  tournamentId: integer('tournament_id')
    .notNull()
    .references(() => tournament.id),
  stadium: text('stadium').notNull(),
  matchDatetime: timestamp('match_datetime', { mode: 'date' }).notNull(),
  status: matchStatusEnum('match_status').notNull(),
  teamAId: integer('team_a_id')
    .notNull()
    .references(() => tournamentTeam.id),
  teamBId: integer('team_b_id')
    .notNull()
    .references(() => tournamentTeam.id),
  round: roundEnum('round').notNull(),
  teamAScore: integer('team_a_score'),
  teamBScore: integer('team_b_score'),
  penaltyResult: integer('penalty_result'), // Would reference a team ID for the penalty winner
})

export const tournamentScore = pgTable('tournament_score', {
  id: serial('id').primaryKey(),
  userScore: integer('user_score').notNull().default(0),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  tournamentId: integer('tournament_id')
    .notNull()
    .references(() => tournament.id),
})

export const matchPrediction = pgTable(
  'match_prediction',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    matchId: integer('match_id')
      .notNull()
      .references(() => match.id),
    teamAScore: integer('team_a_score'),
    teamBScore: integer('team_b_score'),
    penaltyResult: text('penalties_result'), // 'teamA' or 'teamB'
  },
  (t) => [unique().on(t.userId, t.matchId)],
)

export const winnerPrediction = pgTable(
  'winner_prediction',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    tournamentTeamId: integer('tournament_team_id')
      .notNull()
      .references(() => tournamentTeam.id),
    tournamentId: integer('tournament_id')
      .notNull()
      .references(() => tournament.id),
    round: roundEnum('round').notNull(),
  },
  (t) => [unique().on(t.userId, t.tournamentId, t.round)],
)

export const userRelations = relations(user, ({ many }) => ({
  matchPredictions: many(matchPrediction),
  winnerPredictions: many(winnerPrediction),
  adminGroups: many(group),
  groupMemberships: many(groupMember),
}))

export const tournamentRelations = relations(tournament, ({ many }) => ({
  teams: many(tournamentTeam),
  matches: many(match),
  groups: many(group),
  tournamentGroups: many(tournamentGroup),
  winnerPredictions: many(winnerPrediction),
}))

export const tournamentTeamRelations = relations(
  tournamentTeam,
  ({ one, many }) => ({
    tournament: one(tournament, {
      fields: [tournamentTeam.tournamentId],
      references: [tournament.id],
    }),
    tournamentGroup: one(tournamentGroup, {
      fields: [tournamentTeam.tournamentGroupId],
      references: [tournamentGroup.id],
    }),
    homeMatches: many(match, { relationName: 'teamA' }),
    awayMatches: many(match, { relationName: 'teamB' }),
    winnerPredictions: many(winnerPrediction),
  }),
)

export const groupRelations = relations(group, ({ one, many }) => ({
  admin: one(user, {
    fields: [group.adminId],
    references: [user.id],
  }),
  tournament: one(tournament, {
    fields: [group.tournamentId],
    references: [tournament.id],
  }),
  members: many(groupMember),
  inviteCodes: many(groupInvite),
}))

export const groupMemberRelations = relations(groupMember, ({ one }) => ({
  group: one(group, {
    fields: [groupMember.groupId],
    references: [group.id],
  }),
  user: one(user, {
    fields: [groupMember.userId],
    references: [user.id],
  }),
}))

export const groupInviteRelations = relations(groupInvite, ({ one }) => ({
  group: one(group, {
    fields: [groupInvite.groupId],
    references: [group.id],
  }),
}))

export const tournamentGroupRelations = relations(
  tournamentGroup,
  ({ one, many }) => ({
    tournament: one(tournament, {
      fields: [tournamentGroup.tournamentId],
      references: [tournament.id],
    }),
    teams: many(tournamentTeam),
  }),
)

export const matchRelations = relations(match, ({ one, many }) => ({
  tournament: one(tournament, {
    fields: [match.tournamentId],
    references: [tournament.id],
  }),
  teamA: one(tournamentTeam, {
    fields: [match.teamAId],
    references: [tournamentTeam.id],
    relationName: 'teamA',
  }),
  teamB: one(tournamentTeam, {
    fields: [match.teamBId],
    references: [tournamentTeam.id],
    relationName: 'teamB',
  }),
  predictions: many(matchPrediction),
}))

export const matchPredictionRelations = relations(
  matchPrediction,
  ({ one }) => ({
    user: one(user, {
      fields: [matchPrediction.userId],
      references: [user.id],
    }),
    match: one(match, {
      fields: [matchPrediction.matchId],
      references: [match.id],
    }),
  }),
)

export const winnerPredictionRelations = relations(
  winnerPrediction,
  ({ one }) => ({
    user: one(user, {
      fields: [winnerPrediction.userId],
      references: [user.id],
    }),
    team: one(tournamentTeam, {
      fields: [winnerPrediction.tournamentTeamId],
      references: [tournamentTeam.id],
    }),
    tournament: one(tournament, {
      fields: [winnerPrediction.tournamentId],
      references: [tournament.id],
    }),
  }),
)
