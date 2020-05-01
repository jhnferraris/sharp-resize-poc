const { Worker } = require("worker_threads");
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

module.exports = (fastify, opts, done) => {
  fastify.post("/upload", async function (req, reply) {
    const files = req.raw.files;
    if (!files || Object.keys(files).length === 0) {
      return reply.status(400).send("No files were uploaded.");
    }

    const originalFilename = files.media.name.split(".")[0];
    const imageBuffer = files.media.data;

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
    reply.send({ success: true, ...filenames });
  });
  done();
};
