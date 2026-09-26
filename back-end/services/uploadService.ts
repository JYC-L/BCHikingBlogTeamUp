import crypto from "crypto";
import s3 from "../config/awsConfig";

const uploadFileToS3 = async (file: Express.Multer.File): Promise<string> => {
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  if (!bucket) {
    throw new Error("AWS_S3_BUCKET_NAME is missing");
  }
  const safeName = String(file.originalname || "photo").replace(/[^\w.\-]+/g, "_");
  const data = await s3
    .upload({
      Bucket: bucket,
      Key: `${crypto.randomUUID()}-${safeName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
    .promise();
  return data.Location;
};

export default uploadFileToS3;
