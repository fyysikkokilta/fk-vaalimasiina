import * as Minio from 'minio'

import { env } from '~/env'

// Check if S3 is configured
export function isS3Configured() {
  return !!(
    env.S3_ACCESS_KEY_ID &&
    env.S3_SECRET_ACCESS_KEY &&
    env.S3_BUCKET_NAME &&
    env.S3_ENDPOINT
  )
}

// Create MinIO client only if S3 is configured
function createS3Client() {
  if (!isS3Configured()) {
    return null
  }

  const endpointUrl = new URL(env.S3_ENDPOINT!)

  return new Minio.Client({
    endPoint: endpointUrl.hostname,
    port: endpointUrl.port
      ? parseInt(endpointUrl.port)
      : endpointUrl.protocol === 'https:'
        ? 443
        : 80,
    useSSL: endpointUrl.protocol === 'https:',
    accessKey: env.S3_ACCESS_KEY_ID!,
    secretKey: env.S3_SECRET_ACCESS_KEY!,
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
      env.S3_BUCKET_NAME!,
      fileName,
      csvContent,
      csvContent.length,
      {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    )

    return fileName
  } catch (error) {
    // Log error type only to avoid leaking S3 credentials in stack traces
    console.error(
      'Error uploading CSV to S3:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    throw new Error('Failed to upload CSV file to storage')
  }
}

export async function getCsvFromS3(fileName: string) {
  const client = createS3Client()
  if (!client) {
    return null
  }

  try {
    const stream = await client.getObject(env.S3_BUCKET_NAME!, fileName)

    // Convert stream to string
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk as ArrayBufferLike))
    }
    const content = Buffer.concat(chunks).toString('utf-8')

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

export async function fileExistsInS3(fileName: string) {
  const client = createS3Client()
  if (!client) {
    return false
  }

  try {
    await client.statObject(env.S3_BUCKET_NAME!, fileName)
    return true
  } catch {
    return false
  }
}

export async function getSignedDownloadUrl(fileName: string) {
  const client = createS3Client()
  if (!client) {
    return null
  }

  try {
    const signedUrl = await client.presignedGetObject(
      env.S3_BUCKET_NAME!,
      fileName,
      3600 // 1 hour expiry
    )
    return signedUrl
  } catch (error) {
    // Log error type only to avoid leaking S3 credentials in stack traces
    console.error(
      'Error generating signed URL:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    throw new Error('Failed to generate download URL')
  }
}
