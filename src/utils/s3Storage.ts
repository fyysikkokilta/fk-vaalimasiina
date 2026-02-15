import { S3mini } from 's3mini'

import { env } from '~/env'

// Check if S3 is configured
export function isS3Configured() {
  return !!(env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY && env.S3_ENDPOINT)
}

// Create S3 client only if S3 is configured
function createS3Client() {
  if (!isS3Configured()) {
    return null
  }

  return new S3mini({
    endpoint: env.S3_ENDPOINT!,
    accessKeyId: env.S3_ACCESS_KEY_ID!,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
    region: env.S3_REGION
  })
}

export async function uploadCsvToS3(fileName: string, csvContent: string) {
  const client = createS3Client()
  if (!client) {
    console.warn('S3 not configured, skipping CSV upload')
    return null
  }

  try {
    await client.putObject(
      fileName,
      csvContent,
      'text/csv',
      undefined,
      undefined,
      csvContent.length
    )

    return fileName
  } catch (error) {
    // Log error type only to avoid leaking S3 credentials in stack traces
    console.error(
      'Error uploading CSV to S3:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    throw new Error('Failed to upload CSV file to storage', { cause: error })
  }
}

export async function getCsvFromS3(fileName: string) {
  const client = createS3Client()
  if (!client) {
    return null
  }

  try {
    const content = await client.getObject(fileName)

    return content
  } catch (error) {
    // Log error type only to avoid leaking S3 credentials in stack traces
    console.error(
      'Error fetching CSV from S3:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    return null
  }
}
