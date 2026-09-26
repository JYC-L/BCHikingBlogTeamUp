const crypto = require("crypto");
const s3 = require("../config/awsConfig");

const uploadFileToS3 = async (file) => {
  const safeName = String(file.originalname || "photo").replace(/[^\w.\-]+/g, "_");
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${crypto.randomUUID()}-${safeName}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const data = await s3.upload(params).promise();
  return data.Location;
};

module.exports = uploadFileToS3;
