const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({});

const bucketName = process.env.BUCKET_NAME;

exports.handler = async (event) => {
  const body = JSON.parse(event.body);

  try {
    const files = body.files;

    const urls = await Promise.all(
      files.map(async (file) => {
        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: `uploads/${file.name}.jpg`,
          // size: file.size,
        });

        const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL expires in 1 hour
        return { name: file.name, url };
      })
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Failed to get signed URLs", error }),
    };
  }
};
