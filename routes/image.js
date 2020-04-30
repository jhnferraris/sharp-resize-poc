const express = require("express");

const { Worker } = require("worker_threads");
const router = express.Router();

function executeResize(filenames, imageBuffer) {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./workers/resize.js", {
      workerData: {
        filenames,
        imageBuffer,
      },
    });
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}

router.post("/", async function (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  const originalFilename = req.files.media.name.split(".")[0];
  const imageBuffer = req.files.media.data;

  const randomSugar = Math.random().toString(36).substr(2, 6);
  const randomName = Math.random().toString(36).substr(2, 6);
  const uriPrefix = `${process.env.S3_STORAGE_ENDPOINT}/${process.env.S3_STORAGE_BUCKET}/`;
  const filenames = {
    mobile: {
      key: `${`${originalFilename}-${randomSugar}-${randomName}_mobile`.replace(
        /\s/g,
        "-"
      )}.jpg`,
      uri: `${uriPrefix}${`${originalFilename}-${randomSugar}-${randomName}_mobile`.replace(
        /\s/g,
        "-"
      )}.jpg`,
    },
    thumbnail: {
      key: `${`${originalFilename}-${randomSugar}-${randomName}_thumbnail`.replace(
        /\s/g,
        "-"
      )}.jpg`,
      uri: `${uriPrefix}${`${originalFilename}-${randomSugar}-${randomName}_thumbnail`.replace(
        /\s/g,
        "-"
      )}.jpg`,
    },
  };

  executeResize(filenames, imageBuffer);
  res.json({ success: true, ...filenames });
});

module.exports = router;
