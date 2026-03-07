DROP INDEX "unique_active_election";--> statement-breakpoint
CREATE UNIQUE INDEX "unique_active_election" ON "elections" ((TRUE)) WHERE "status" <> 'CLOSED';--> statement-breakpoint
DROP INDEX "unique_voters_electionId_email";--> statement-breakpoint
CREATE UNIQUE INDEX "unique_voters_electionId_email" ON "voters" ("election_id",lower("email"::text));--> statement-breakpoint
ALTER TABLE "elections" DROP CONSTRAINT "check_elections_seats", ADD CONSTRAINT "check_elections_seats" CHECK ("seats" > 0);--> statement-breakpoint
ALTER TABLE "votes" DROP CONSTRAINT "check_votes_rank", ADD CONSTRAINT "check_votes_rank" CHECK ("rank" > 0);