CREATE TYPE "public"."voting_method" AS ENUM('STV', 'MAJORITY');--> statement-breakpoint
ALTER TABLE "elections" ADD COLUMN "voting_method" "voting_method" DEFAULT 'STV' NOT NULL;