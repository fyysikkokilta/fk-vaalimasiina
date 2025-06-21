import * as Minio from 'minio'

import { env } from '~/env'

// Check if S3 is configured
export function isS3Configured(): boolean {
  return !!(
    env.S3_ACCESS_KEY_ID &&
    env.S3_SECRET_ACCESS_KEY &&
    env.S3_BUCKET_NAME &&
    env.S3_ENDPOINT
  )
}

// Create MinIO client only if S3 is configured
function createS3Client(): Minio.Client | null {
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

export async function uploadCsvToS3(
  fileName: string,
  csvContent: string
): Promise<string | null> {
  const client = createS3Client()
  if (!client) {
    console.warn('S3 not configured, skipping CSV upload')
    return null
  }

  const key = `election-results/${fileName}`

  try {
    await client.putObject(
      env.S3_BUCKET_NAME!,
      key,
      csvContent,
      csvContent.length,
      {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    )

    return key
  } catch (error) {
    console.error('Error uploading CSV to S3:', error)
    throw new Error('Failed to upload CSV file to storage')
  }
}

export async function getCsvFromS3(filePath: string): Promise<string | null> {
  const client = createS3Client()
  if (!client) {
    return null
  }

  try {
    const stream = await client.getObject(env.S3_BUCKET_NAME!, filePath)

    // Convert stream to string
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk as ArrayBufferLike))
    }
    const content = Buffer.concat(chunks).toString('utf-8')

    return content
  } catch (error) {
    console.error('Error fetching CSV from S3:', error)
    return null
  }
}

export async function fileExistsInS3(filePath: string): Promise<boolean> {
  const client = createS3Client()
  if (!client) {
    return false
  }

  try {
    await client.statObject(env.S3_BUCKET_NAME!, filePath)
    return true
  } catch {
    return false
  }
}

export async function getSignedDownloadUrl(
  filePath: string
): Promise<string | null> {
  const client = createS3Client()
  if (!client) {
    return null
  }

  try {
    const signedUrl = await client.presignedGetObject(
      env.S3_BUCKET_NAME!,
      filePath,
      3600 // 1 hour expiry
    )
    return signedUrl
  } catch (error) {
    console.error('Error generating signed URL:', error)
    throw new Error('Failed to generate download URL')
  }
}
