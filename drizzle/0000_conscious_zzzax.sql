CREATE TYPE "public"."matchStatus" AS ENUM('upcoming', 'ongoing', 'completed');--> statement-breakpoint
CREATE TYPE "public"."round" AS ENUM('group', 'round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'eliminated', 'winner');--> statement-breakpoint
CREATE TYPE "public"."tournamentStatus" AS ENUM('upcoming', 'ongoing', 'completed');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"admin_id" text NOT NULL,
	"tournament_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_invite" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"code" varchar(10) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_member" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "group_member_group_id_user_id_unique" UNIQUE("group_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "match" (
	"id" serial PRIMARY KEY NOT NULL,
	"tournament_id" integer NOT NULL,
	"stadium" text NOT NULL,
	"match_datetime" timestamp NOT NULL,
	"match_status" "matchStatus" NOT NULL,
	"team_a_id" integer NOT NULL,
	"team_b_id" integer NOT NULL,
	"round" "round" NOT NULL,
	"team_a_score" integer,
	"team_b_score" integer,
	"penalty_result" integer
);
--> statement-breakpoint
CREATE TABLE "match_prediction" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"match_id" integer NOT NULL,
	"team_a_score" integer,
	"team_b_score" integer,
	"penalties_result" text,
	CONSTRAINT "match_prediction_user_id_match_id_unique" UNIQUE("user_id","match_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "tournament" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"location" text NOT NULL,
	"tournament_status" "tournamentStatus" NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"current_stage" "round" DEFAULT 'group' NOT NULL,
	CONSTRAINT "tournament_name_start_date_end_date_unique" UNIQUE("name","start_date","end_date")
);
--> statement-breakpoint
CREATE TABLE "tournament_group" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"tournament_id" integer NOT NULL,
	CONSTRAINT "tournament_group_tournament_id_name_unique" UNIQUE("tournament_id","name")
);
--> statement-breakpoint
CREATE TABLE "tournament_score" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_score" integer DEFAULT 0 NOT NULL,
	"user_id" text NOT NULL,
	"tournament_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournament_team" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"tournament_id" integer NOT NULL,
	"flag" text NOT NULL,
	"tournament_group_id" integer NOT NULL,
	"group_points" integer,
	"status" "status" DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'user',
	"country" text,
	"country_flag" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "winner_prediction" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"tournament_team_id" integer NOT NULL,
	"tournament_id" integer NOT NULL,
	"round" "round" NOT NULL,
	CONSTRAINT "winner_prediction_user_id_tournament_id_round_unique" UNIQUE("user_id","tournament_id","round")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group" ADD CONSTRAINT "group_admin_id_user_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group" ADD CONSTRAINT "group_tournament_id_tournament_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournament"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_member" ADD CONSTRAINT "group_member_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_member" ADD CONSTRAINT "group_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match" ADD CONSTRAINT "match_tournament_id_tournament_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournament"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match" ADD CONSTRAINT "match_team_a_id_tournament_team_id_fk" FOREIGN KEY ("team_a_id") REFERENCES "public"."tournament_team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match" ADD CONSTRAINT "match_team_b_id_tournament_team_id_fk" FOREIGN KEY ("team_b_id") REFERENCES "public"."tournament_team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_prediction" ADD CONSTRAINT "match_prediction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_prediction" ADD CONSTRAINT "match_prediction_match_id_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."match"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_group" ADD CONSTRAINT "tournament_group_tournament_id_tournament_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournament"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_score" ADD CONSTRAINT "tournament_score_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_score" ADD CONSTRAINT "tournament_score_tournament_id_tournament_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournament"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_team" ADD CONSTRAINT "tournament_team_tournament_id_tournament_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournament"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_team" ADD CONSTRAINT "tournament_team_tournament_group_id_tournament_group_id_fk" FOREIGN KEY ("tournament_group_id") REFERENCES "public"."tournament_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "winner_prediction" ADD CONSTRAINT "winner_prediction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "winner_prediction" ADD CONSTRAINT "winner_prediction_tournament_team_id_tournament_team_id_fk" FOREIGN KEY ("tournament_team_id") REFERENCES "public"."tournament_team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "winner_prediction" ADD CONSTRAINT "winner_prediction_tournament_id_tournament_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournament"("id") ON DELETE no action ON UPDATE no action;