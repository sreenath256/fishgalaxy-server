const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Configure Cloudflare R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function uploadToR2(filePath, fileName) {
  try {
    // Read the file content
    const fileContent = fs.readFileSync(filePath);

    // Upload parameters
    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: fileContent,
      ContentType: 'application/pdf',
      ACL: 'public-read', // Remove this if using signed URLs
    };

    // Execute upload
    const command = new PutObjectCommand(uploadParams);
    await r2Client.send(command);

    // Return public URL
    if (process.env.R2_PUBLIC_ENDPOINT) {
      // If using custom domain
      return `${process.env.R2_PUBLIC_ENDPOINT}/${fileName}`;
    } else {
      // Standard R2 URL
      return `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${fileName}`;
    }
  } catch (error) {
    console.error('R2 Upload Error:', error);
    throw new Error('Failed to upload invoice to storage');
  }
}

module.exports = uploadToR2;