DROP INDEX IF EXISTS "idx_voters_electionId_email";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_votes_ballotId_preferenceNumber";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_votes_ballotId_candidateId";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_voters_electionId_email" ON "voters" USING btree ("election_id",lower("email"));--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "unique_votes_ballotId_preferenceNumber" UNIQUE("ballot_id","preference_number");--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "unique_votes_ballotId_candidateId" UNIQUE("ballot_id","candidate_id");