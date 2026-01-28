import { queryOptions } from '@tanstack/react-query'
import { roundEnum } from '@/db/schema'
import {
  getLatestTournament,
  getActiveTournamentTeams,
  getGroupsForUser,
  getAllGroupsForUser,
  getWinnerPredictionsForUser,
  getAllUserMatchPredictions,
  getGroup,
  getGroupPlayers,
  getGroupDetails,
  getTournamentMatchesByRound,
  getDashboardStats,
  getAllTournaments,
  getTournamentGroups,
  getTournamentTeams,
  getTournamentMatches,
  getGlobalLeaderboard,
  getUserLeaderboardScore,
} from './queries'

export const latestTournamentQueryOptions = () =>
  queryOptions({
    queryKey: ['latestTournament'],
    queryFn: getLatestTournament,
  })

export const activeTournamentTeamsQueryOptions = (tournamentId: number) =>
  queryOptions({
    queryKey: ['activeTournamentTeams', tournamentId],
    queryFn: () => getActiveTournamentTeams({ data: { tournamentId } }),
  })

export const groupsForUserQueryOptions = (tournamentId: number) =>
  queryOptions({
    queryKey: ['groupsForUser', tournamentId],
    queryFn: () => getGroupsForUser({ data: { tournamentId } }),
  })

export const allGroupsForUserQueryOptions = () =>
  queryOptions({
    queryKey: ['allGroupsForUser'],
    queryFn: getAllGroupsForUser,
  })

export const winnerPredictionsForUserQueryOptions = (tournamentId: number) =>
  queryOptions({
    queryKey: ['winnerPredictionsForUser', tournamentId],
    queryFn: () => getWinnerPredictionsForUser({ data: { tournamentId } }),
  })

export const allUserMatchPredictionsQueryOptions = (tournamentId: number) =>
  queryOptions({
    queryKey: ['allUserMatchPredictions', tournamentId],
    queryFn: () => getAllUserMatchPredictions({ data: { tournamentId } }),
  })

export const groupQueryOptions = (groupId: number) =>
  queryOptions({
    queryKey: ['group', groupId],
    queryFn: () => getGroup({ data: { groupId } }),
  })

export const groupPlayersQueryOptions = (groupId: number) =>
  queryOptions({
    queryKey: ['groupPlayers', groupId],
    queryFn: () => getGroupPlayers({ data: { groupId } }),
  })

export const groupDetailsQueryOptions = (groupId: number) =>
  queryOptions({
    queryKey: ['groupDetails', groupId],
    queryFn: () => getGroupDetails({ data: { groupId } }),
  })

export const tournamentMatchesByRoundQueryOptions = (
  tournamentId: number,
  round: (typeof roundEnum.enumValues)[number],
) =>
  queryOptions({
    queryKey: ['tournamentMatchesByRound', tournamentId, round],
    queryFn: () =>
      getTournamentMatchesByRound({ data: { tournamentId, round } }),
  })

export const dashboardStatsQueryOptions = () =>
  queryOptions({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  })

export const allTournamentsQueryOptions = () =>
  queryOptions({
    queryKey: ['allTournaments'],
    queryFn: getAllTournaments,
  })

export const tournamentGroupsQueryOptions = (tournamentId: number) =>
  queryOptions({
    queryKey: ['tournamentGroups', tournamentId],
    queryFn: () => getTournamentGroups({ data: { tournamentId } }),
  })

export const tournamentTeamsQueryOptions = (tournamentId: number) =>
  queryOptions({
    queryKey: ['tournamentTeams', tournamentId],
    queryFn: () => getTournamentTeams({ data: { tournamentId } }),
  })

export const tournamentMatchesQueryOptions = (tournamentId: number) =>
  queryOptions({
    queryKey: ['tournamentMatches', tournamentId],
    queryFn: () => getTournamentMatches({ data: { tournamentId } }),
  })

export const globalLeaderboardQueryOptions = (
  tournamentId: number,
  limit?: number,
) =>
  queryOptions({
    queryKey: ['globalLeaderboard', tournamentId, limit],
    queryFn: () => getGlobalLeaderboard({ data: { tournamentId, limit } }),
  })

export const userLeaderboardScoreQueryOptions = (tournamentId: number) =>
  queryOptions({
    queryKey: ['userLeaderboardScore', tournamentId],
    queryFn: () => getUserLeaderboardScore({ data: { tournamentId } }),
  })
