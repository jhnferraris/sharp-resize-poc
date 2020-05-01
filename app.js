const fastify = require("fastify");
const fileUpload = require("fastify-file-upload");
const uploadRoutes = require("./routes/upload");

const app = fastify({
  logger: true,
});
app.register(fileUpload, {
  limits: { fileSize: 50 * 1024 * 1024 },
});

app.get("/", function (request, reply) {
  reply.send({ hello: "world" });
});

app.register(uploadRoutes);

module.exports = app;
