import * as Minio from 'minio'

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
})

const BUCKET_NAME = process.env.MINIO_BUCKET || 'hms-documents'

export async function ensureBucket() {
  const exists = await minioClient.bucketExists(BUCKET_NAME)
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME, 'us-east-1')
    // Set bucket policy to allow read access
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
        },
      ],
    }
    await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy))
  }
}

export async function uploadFile(
  objectName: string,
  file: Buffer,
  contentType: string
): Promise<string> {
  await ensureBucket()
  await minioClient.putObject(BUCKET_NAME, objectName, file, file.length, {
    'Content-Type': contentType,
  })
  return objectName
}

export async function getFile(objectName: string): Promise<Buffer> {
  const dataStream = await minioClient.getObject(BUCKET_NAME, objectName)
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    dataStream.on('data', (chunk) => chunks.push(chunk))
    dataStream.on('end', () => resolve(Buffer.concat(chunks)))
    dataStream.on('error', reject)
  })
}

export async function deleteFile(objectName: string): Promise<void> {
  await minioClient.removeObject(BUCKET_NAME, objectName)
}

export async function getFileUrl(objectName: string, expiry: number = 3600): Promise<string> {
  return minioClient.presignedGetObject(BUCKET_NAME, objectName, expiry)
}

export { minioClient, BUCKET_NAME }
