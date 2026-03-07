ALTER TABLE "votes" RENAME COLUMN "preference_number" TO "rank";--> statement-breakpoint
ALTER TABLE "votes" DROP CONSTRAINT "unique_votes_ballotId_preferenceNumber";--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "unique_votes_ballotId_rank" UNIQUE("ballot_id","rank");--> statement-breakpoint
ALTER TABLE "elections" ADD CONSTRAINT "check_elections_seats" CHECK ("elections"."seats" > 0);--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "check_votes_rank" CHECK ("votes"."rank" > 0);