CREATE TYPE "public"."election_status" AS ENUM('CREATED', 'ONGOING', 'FINISHED', 'CLOSED');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ballots" (
	"ballot_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"election_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "candidates" (
	"candidate_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"election_id" uuid NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "elections" (
	"election_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" varchar NOT NULL,
	"seats" integer NOT NULL,
	"status" "election_status" DEFAULT 'CREATED' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "voters" (
	"voter_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"election_id" uuid NOT NULL,
	"email" varchar NOT NULL,
	"has_voted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "votes" (
	"vote_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ballot_id" uuid NOT NULL,
	"candidate_id" uuid NOT NULL,
	"preference_number" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ballots" ADD CONSTRAINT "ballots_election_id_elections_election_id_fk" FOREIGN KEY ("election_id") REFERENCES "public"."elections"("election_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "candidates" ADD CONSTRAINT "candidates_election_id_elections_election_id_fk" FOREIGN KEY ("election_id") REFERENCES "public"."elections"("election_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "voters" ADD CONSTRAINT "voters_election_id_elections_election_id_fk" FOREIGN KEY ("election_id") REFERENCES "public"."elections"("election_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_ballot_id_ballots_ballot_id_fk" FOREIGN KEY ("ballot_id") REFERENCES "public"."ballots"("ballot_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_candidate_id_candidates_candidate_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("candidate_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_voters_electionId_email" ON "voters" USING btree ("election_id","email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_votes_ballotId_preferenceNumber" ON "votes" USING btree ("ballot_id","preference_number");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_votes_ballotId_candidateId" ON "votes" USING btree ("ballot_id","candidate_id");