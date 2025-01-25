CREATE TABLE IF NOT EXISTS "has_voted" (
	"has_voted_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"voter_id" uuid NOT NULL,
	CONSTRAINT "unique_voters_voterId" UNIQUE("voter_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "has_voted" ADD CONSTRAINT "has_voted_voter_id_voters_voter_id_fk" FOREIGN KEY ("voter_id") REFERENCES "public"."voters"("voter_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "voters" DROP COLUMN IF EXISTS "has_voted";