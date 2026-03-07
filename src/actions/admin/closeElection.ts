'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { db } from '~/db'
import { elections } from '~/db/schema'
import { generateCsvContent, generateCsvFileName } from '~/utils/csvGenerator'
import { isS3Configured, uploadCsvToS3 } from '~/utils/s3Storage'

const closeElectionSchema = z.object({
  electionId: z.uuid('Election identifier must be a valid UUID')
})

export const closeElection = actionClient
  .inputSchema(closeElectionSchema)
  .use(isAuthorizedMiddleware)
  .action(async ({ parsedInput: { electionId } }) => {
    try {
      // First, get the election data
      const election = await db.query.elections.findFirst({
        where: {
          electionId,
          status: 'FINISHED'
        },
        with: {
          candidates: true
        }
      })

      if (!election) {
        throw new ActionError('Election not found')
      }

      let filePath: string | null = null

      // Only generate and upload CSV if S3 is configured
      if (isS3Configured()) {
        // Get ballots and votes for CSV generation
        const ballots = await db.query.ballots.findMany({
          where: {
            electionId
          },
          with: {
            votes: {
              orderBy: {
                rank: 'asc'
              }
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
        .update(elections)
        .set({
          status: 'CLOSED',
          csvFilePath: filePath
        })
        .where(and(eq(elections.electionId, electionId), eq(elections.status, 'FINISHED')))
        .returning({
          status: elections.status
        })

      if (!statuses[0]) {
        throw new ActionError('Election not found')
      }

      revalidatePath('/[locale]/elections', 'page')
      revalidatePath('/[locale]/audit', 'page')
      revalidatePath('/[locale]/admin', 'page')

      return { message: 'Election closed' }
    } catch (error) {
      console.error('Error closing election:', error)
      if (error instanceof ActionError) {
        throw error
      }
      throw new ActionError('Failed to close election and store results')
    }
  })
