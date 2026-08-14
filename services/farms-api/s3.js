const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

const s3 = new S3Client({
  endpoint: `https://${process.env.SPACES_REGION}.digitaloceanspaces.com`,
  region: process.env.SPACES_REGION,
  credentials: {
    accessKeyId: process.env.SPACES_KEY,
    secretAccessKey: process.env.SPACES_SECRET
  }
});

async function uploadPhoto(buffer, mimeType) {
  const key = `field-logs/${crypto.randomUUID()}.jpg`;
  await s3.send(new PutObjectCommand({
    Bucket: process.env.SPACES_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    ACL: 'private'
  }));
  return `https://${process.env.SPACES_BUCKET}.${process.env.SPACES_REGION}.digitaloceanspaces.com/${key}`;
}

module.exports = { uploadPhoto };
