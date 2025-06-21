'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { db } from '~/db'
import { ballotsTable, electionsTable } from '~/db/schema'
import { generateCsvContent, generateCsvFileName } from '~/utils/csvGenerator'
import { isS3Configured, uploadCsvToS3 } from '~/utils/s3Storage'

const closeElectionSchema = async () => {
  const t = await getTranslations('actions.closeElection.validation')
  return z.object({
    electionId: z
      .string({
        message: t('electionId_string')
      })
      .uuid({ message: t('electionId_uuid') })
  })
}

export const closeElection = actionClient
  .inputSchema(closeElectionSchema)
  .use(isAuthorizedMiddleware)
  .action(async ({ parsedInput: { electionId } }) => {
    const t = await getTranslations('actions.closeElection.action_status')

    try {
      // First, get the election data
      const election = await db.query.electionsTable.findFirst({
        where: and(
          eq(electionsTable.electionId, electionId),
          eq(electionsTable.status, 'FINISHED')
        ),
        with: {
          candidates: true
        }
      })

      if (!election) {
        throw new ActionError(t('election_not_found'))
      }

      let filePath: string | null = null

      // Only generate and upload CSV if S3 is configured
      if (isS3Configured()) {
        // Get ballots and votes for CSV generation
        const ballots = await db.query.ballotsTable.findMany({
          where: eq(ballotsTable.electionId, electionId),
          with: {
            votes: {
              orderBy: (votes, { asc }) => [asc(votes.rank)]
            }
          }
        })

        // Generate CSV content
        const csvContent = generateCsvContent(ballots, election)
        const fileName = generateCsvFileName(election)

        // Upload to S3-compatible storage
        filePath = await uploadCsvToS3(fileName, csvContent)
      }

      // Update election status and store file path (if S3 is configured)
      const statuses = await db
        .update(electionsTable)
        .set({
          status: 'CLOSED',
          csvFilePath: filePath
        })
        .where(
          and(
            eq(electionsTable.electionId, electionId),
            eq(electionsTable.status, 'FINISHED')
          )
        )
        .returning({
          status: electionsTable.status
        })

      if (!statuses[0]) {
        throw new ActionError(t('election_not_found'))
      }

      revalidatePath('/[locale]/elections', 'page')
      revalidatePath('/[locale]/audit', 'page')
      revalidatePath('/[locale]/admin', 'page')

      return { message: t('election_closed') }
    } catch (error) {
      console.error('Error closing election:', error)
      if (error instanceof ActionError) {
        throw error
      }
      throw new ActionError('Failed to close election and store results')
    }
  })
