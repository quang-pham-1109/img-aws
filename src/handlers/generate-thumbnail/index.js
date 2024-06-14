const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");
const Jimp = require("jimp");

const s3 = new S3Client({});

const IMAGE_SIZE_LIMIT = 1048576; // 1MB

exports.handler = async (event) => {
  for (const record of event.Records) {
    const message = JSON.parse(record.body);

    if (!message.Records || message.Records.length === 0) {
      console.error("No records in message:", message);
      return;
    }

    const key = message.Records[0].s3.object.key;
    const bucket = message.Records[0].s3.bucket.name;

    try {
      const headImageData = await s3.send(
        new HeadObjectCommand({ Bucket: bucket, Key: key })
      );

      if (headImageData.ContentLength > IMAGE_SIZE_LIMIT) {
        throw new Error("Image is too large:", headImageData.ContentLength);
      }

      const originalImage = await s3.send(
        new GetObjectCommand({ Bucket: bucket, Key: key })
      );

      const chunks = [];
      for await (const chunk of originalImage.Body) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      const image = await Jimp.read(buffer);
      const croppedImage = await image
        .resize(100, 100)
        .quality(60)
        .getBufferAsync(Jimp.MIME_JPEG);

      const croppedImagePath = key.replace("uploads/", "thumps/");
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: `${croppedImagePath}_thump.jpg`,
          Body: croppedImage,
          ContentType: "image/jpeg",
        })
      );
    } catch (error) {
      console.error(error);
    }
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
  };
};
