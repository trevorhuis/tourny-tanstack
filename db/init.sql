-- Create enums
CREATE TYPE "tournamentStatus" AS ENUM ('upcoming', 'ongoing', 'completed');
CREATE TYPE "matchStatus" AS ENUM ('upcoming', 'ongoing', 'completed');
CREATE TYPE "round" AS ENUM ('group', 'round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final');
CREATE TYPE "status" AS ENUM ('active', 'eliminated', 'winner');

-- Insert Tournament: World Cup 2026
INSERT INTO tournament (name, slug, location, tournament_status, start_date, end_date, current_stage)
VALUES ('World Cup 2026', 'world-cup-2026', 'USA, Canada, Mexico', 'ongoing', '2026-06-11', '2026-07-19', 'group');

-- Insert Tournament Groups (Group A, B, C, D)
INSERT INTO tournament_group (name, tournament_id) VALUES
('Group A', 1),
('Group B', 1),
('Group C', 1),
('Group D', 1);

-- Insert Teams for Group A
INSERT INTO tournament_team (name, tournament_id, flag, tournament_group_id, group_points, status) VALUES
('Germany', 1, '🇩🇪', 1, 7, 'active'),
('Spain', 1, '🇪🇸', 1, 6, 'active'),
('Japan', 1, '🇯🇵', 1, 4, 'active'),
('Costa Rica', 1, '🇨🇷', 1, 0, 'active');

-- Insert Teams for Group B
INSERT INTO tournament_team (name, tournament_id, flag, tournament_group_id, group_points, status) VALUES
('England', 1, '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 2, 7, 'active'),
('USA', 1, '🇺🇸', 2, 5, 'active'),
('Iran', 1, '🇮🇷', 2, 3, 'active'),
('Wales', 1, '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 2, 1, 'active');

-- Insert Teams for Group C
INSERT INTO tournament_team (name, tournament_id, flag, tournament_group_id, group_points, status) VALUES
('Argentina', 1, '🇦🇷', 3, 6, 'active'),
('Poland', 1, '🇵🇱', 3, 4, 'active'),
('Mexico', 1, '🇲🇽', 3, 4, 'active'),
('Saudi Arabia', 1, '🇸🇦', 3, 3, 'active');

-- Insert Teams for Group D
INSERT INTO tournament_team (name, tournament_id, flag, tournament_group_id, group_points, status) VALUES
('France', 1, '🇫🇷', 4, 6, 'active'),
('Australia', 1, '🇦🇺', 4, 6, 'active'),
('Tunisia', 1, '🇹🇳', 4, 4, 'active'),
('Denmark', 1, '🇩🇰', 4, 1, 'active');

-- Group Stage Matches - Group A
INSERT INTO match (tournament_id, stadium, match_datetime, match_status, team_a_id, team_b_id, round, team_a_score, team_b_score) VALUES
(1, 'Estadio Azteca', '2026-06-11 16:00:00', 'completed', 1, 4, 'group', 4, 2),
(1, 'Rose Bowl', '2026-06-11 19:00:00', 'completed', 2, 3, 'group', 2, 1),
(1, 'MetLife Stadium', '2026-06-15 13:00:00', 'completed', 1, 2, 'group', 1, 1),
(1, 'BMO Field', '2026-06-15 16:00:00', 'completed', 3, 4, 'group', 1, 0),
(1, 'SoFi Stadium', '2026-06-19 20:00:00', 'completed', 4, 2, 'group', 0, 2),
(1, 'Mercedes-Benz Stadium', '2026-06-19 20:00:00', 'completed', 3, 1, 'group', 1, 2);

-- Group Stage Matches - Group B
INSERT INTO match (tournament_id, stadium, match_datetime, match_status, team_a_id, team_b_id, round, team_a_score, team_b_score) VALUES
(1, 'AT&T Stadium', '2026-06-12 13:00:00', 'completed', 5, 7, 'group', 2, 0),
(1, 'Levi Stadium', '2026-06-12 16:00:00', 'completed', 6, 8, 'group', 1, 1),
(1, 'Lincoln Financial Field', '2026-06-16 13:00:00', 'completed', 8, 7, 'group', 0, 2),
(1, 'NRG Stadium', '2026-06-16 19:00:00', 'completed', 5, 6, 'group', 0, 0),
(1, 'Hard Rock Stadium', '2026-06-20 20:00:00', 'completed', 7, 6, 'group', 1, 0),
(1, 'Gillette Stadium', '2026-06-20 20:00:00', 'completed', 8, 5, 'group', 0, 3);

-- Group Stage Matches - Group C
INSERT INTO match (tournament_id, stadium, match_datetime, match_status, team_a_id, team_b_id, round, team_a_score, team_b_score) VALUES
(1, 'BC Place', '2026-06-13 16:00:00', 'completed', 9, 12, 'group', 1, 2),
(1, 'Arrowhead Stadium', '2026-06-13 19:00:00', 'completed', 10, 11, 'group', 0, 0),
(1, 'Soldier Field', '2026-06-17 13:00:00', 'completed', 9, 11, 'group', 2, 0),
(1, 'Raymond James Stadium', '2026-06-17 16:00:00', 'completed', 12, 10, 'group', 1, 2),
(1, 'Lumen Field', '2026-06-21 20:00:00', 'completed', 12, 11, 'group', 1, 2),
(1, 'GEHA Field', '2026-06-21 20:00:00', 'completed', 10, 9, 'group', 0, 2);

-- Group Stage Matches - Group D
INSERT INTO match (tournament_id, stadium, match_datetime, match_status, team_a_id, team_b_id, round, team_a_score, team_b_score) VALUES
(1, 'Empower Field', '2026-06-14 10:00:00', 'completed', 13, 14, 'group', 4, 1),
(1, 'Bank of America Stadium', '2026-06-14 16:00:00', 'completed', 15, 16, 'group', 0, 0),
(1, 'State Farm Stadium', '2026-06-18 13:00:00', 'completed', 15, 13, 'group', 1, 0),
(1, 'Camping World Stadium', '2026-06-18 16:00:00', 'completed', 16, 14, 'group', 1, 0),
(1, 'Acrisure Stadium', '2026-06-22 16:00:00', 'completed', 14, 15, 'group', 1, 0),
(1, 'Nissan Stadium', '2026-06-22 16:00:00', 'completed', 16, 13, 'group', 1, 0);

-- Round of 16 Matches
INSERT INTO match (tournament_id, stadium, match_datetime, match_status, team_a_id, team_b_id, round, team_a_score, team_b_score) VALUES
(1, 'Rose Bowl', '2026-06-26 16:00:00', 'completed', 1, 8, 'round_of_16', 2, 0),
(1, 'MetLife Stadium', '2026-06-26 20:00:00', 'completed', 5, 4, 'round_of_16', 3, 0),
(1, 'SoFi Stadium', '2026-06-27 16:00:00', 'completed', 9, 14, 'round_of_16', 2, 1),
(1, 'AT&T Stadium', '2026-06-27 20:00:00', 'completed', 13, 10, 'round_of_16', 3, 1),
(1, 'Estadio Azteca', '2026-06-28 16:00:00', 'completed', 2, 7, 'round_of_16', 0, 0),
(1, 'Mercedes-Benz Stadium', '2026-06-28 20:00:00', 'completed', 6, 3, 'round_of_16', 2, 1),
(1, 'Lincoln Financial Field', '2026-06-29 16:00:00', 'completed', 11, 16, 'round_of_16', 1, 0),
(1, 'Levi Stadium', '2026-06-29 20:00:00', 'completed', 15, 12, 'round_of_16', 1, 2);

-- Quarter Finals
INSERT INTO match (tournament_id, stadium, match_datetime, match_status, team_a_id, team_b_id, round, team_a_score, team_b_score, penalty_result) VALUES
(1, 'Hard Rock Stadium', '2026-07-03 16:00:00', 'completed', 1, 5, 'quarter_final', 1, 1, 5),
(1, 'Arrowhead Stadium', '2026-07-03 20:00:00', 'completed', 9, 13, 'quarter_final', 2, 2, 9),
(1, 'NRG Stadium', '2026-07-04 16:00:00', 'completed', 2, 6, 'quarter_final', 1, 2, NULL),
(1, 'Gillette Stadium', '2026-07-04 20:00:00', 'completed', 11, 12, 'quarter_final', 0, 1, NULL);

-- Semi Finals
INSERT INTO match (tournament_id, stadium, match_datetime, match_status, team_a_id, team_b_id, round, team_a_score, team_b_score) VALUES
(1, 'MetLife Stadium', '2026-07-08 20:00:00', 'upcoming', 1, 9, 'semi_final', NULL, NULL),
(1, 'SoFi Stadium', '2026-07-09 20:00:00', 'upcoming', 6, 12, 'semi_final', NULL, NULL);

-- Note: Third Place and Final matches should be created via admin panel after semi-finals complete
-- (team_a_id and team_b_id are required fields)
