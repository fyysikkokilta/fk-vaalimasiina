'use server'

import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { actionClient, ActionError } from '~/actions/safe-action'
import { db } from '~/db'
import { electionsTable } from '~/db/schema'
import { getCsvFromS3, isS3Configured } from '~/utils/s3Storage'

const downloadElectionCsvSchema = z.object({
  electionId: z.uuid('Election identifier must be a valid UUID')
})

export const downloadElectionCsv = actionClient
  .inputSchema(downloadElectionCsvSchema)
  .action(async ({ parsedInput: { electionId } }) => {
    try {
      // If S3 is not configured, return null to indicate fallback to client-side generation
      if (!isS3Configured()) {
        return { electionCsvData: null }
      }

      // Get the election with CSV file path
      const election = await db.query.electionsTable.findFirst({
        where: eq(electionsTable.electionId, electionId),
        columns: {
          csvFilePath: true,
          status: true,
          title: true
        }
      })

      if (!election) {
        throw new ActionError('Election not found')
      }

      if (!election.csvFilePath) {
        // No CSV file stored, return null to indicate fallback to client-side generation
        return { electionCsvData: null }
      }

      // Get the CSV data from S3
      const electionCsvData = await getCsvFromS3(election.csvFilePath)

      return { electionCsvData }
    } catch (error) {
      console.error('Error downloading election CSV:', error)
      if (error instanceof ActionError) {
        throw error
      }
      // For other errors, return null to fallback to client-side generation
      return { electionCsvData: null }
    }
  })
