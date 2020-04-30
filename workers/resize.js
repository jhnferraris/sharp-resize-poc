require("dotenv").config();

const sharp = require("sharp");
const AWS = require("aws-sdk");
const { workerData, parentPort } = require("worker_threads");

const s3Endpoint = new AWS.Endpoint(process.env.S3_STORAGE_ENDPOINT);
const s3 = new AWS.S3({
  endpoint: s3Endpoint,
  accessKeyId: process.env.S3_API_KEY,
  secretAccessKey: process.env.S3_API_SECRET,
});

function upload(data, key) {
  const bucketName = process.env.S3_STORAGE_BUCKET;
  const params = {
    Body: data,
    Bucket: bucketName,
    Key: key,
    ACL: "public-read",
  };
  s3.putObject(params, (err) => {
    if (err) {
      return reject(err);
    }
  });
}

// Had to convert the array to a Buffer
const image = sharp(Buffer.from(workerData.imageBuffer));
image
  .clone()
  .resize({
    width: 45,
    height: 45,
    fit: "inside",
  })
  .jpeg()
  .toBuffer(async (err, data) => {
    if (err) {
      return console.error(err);
    }
    upload(data, workerData.filenames.thumbnail.key);
  });

const scaleImage = image.clone();
scaleImage.metadata().then(({ width }) =>
  scaleImage
    .resize(Math.round(width * 0.5))
    .jpeg()
    .toBuffer()
    .then((data) => {
      return upload(data, workerData.filenames.mobile.key);
    })
);

console.log("Image resizing done!");
parentPort.postMessage("Images successfully resized.");
