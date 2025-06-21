'use server'

import { eq } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'

import { actionClient, ActionError } from '~/actions/safe-action'
import { db } from '~/db'
import { electionsTable } from '~/db/schema'
import {
  fileExistsInS3,
  getSignedDownloadUrl,
  isS3Configured
} from '~/utils/s3Storage'

const downloadElectionCsvSchema = async () => {
  const t = await getTranslations('actions.downloadElectionCsv.validation')
  return z.object({
    electionId: z
      .string({
        message: t('electionId_string')
      })
      .uuid({ message: t('electionId_uuid') })
  })
}

export const downloadElectionCsv = actionClient
  .inputSchema(downloadElectionCsvSchema)
  .action(async ({ parsedInput: { electionId } }) => {
    const t = await getTranslations('actions.downloadElectionCsv.action_status')

    try {
      // If S3 is not configured, return null to indicate fallback to client-side generation
      if (!isS3Configured()) {
        return { downloadUrl: null }
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
        throw new ActionError(t('election_not_found'))
      }

      if (!election.csvFilePath) {
        // No CSV file stored, return null to indicate fallback to client-side generation
        return { downloadUrl: null }
      }

      // Check if file exists in S3-compatible storage
      const fileExists = await fileExistsInS3(election.csvFilePath)
      if (!fileExists) {
        console.warn('File does not exist in S3', election.csvFilePath)
        // File doesn't exist, return null to indicate fallback to client-side generation
        return { downloadUrl: null }
      }

      // Generate signed download URL
      const downloadUrl = await getSignedDownloadUrl(election.csvFilePath)

      return { downloadUrl }
    } catch (error) {
      console.error('Error downloading election CSV:', error)
      if (error instanceof ActionError) {
        throw error
      }
      // For other errors, return null to fallback to client-side generation
      return { downloadUrl: null }
    }
  })
