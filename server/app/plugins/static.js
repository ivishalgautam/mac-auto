import fp from "fastify-plugin";
import fastifyStatic from "@fastify/static";
import { join } from "path";

export default fp(async (fastify) => {
  await fastify.register(fastifyStatic, {
    root: join(process.cwd(), "public"),
    prefix: "/public/",
    setHeaders: (res, pathname) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader(
        "Access-Control-Expose-Headers",
        "Content-Range, Accept-Ranges"
      );
    },
  });
});
