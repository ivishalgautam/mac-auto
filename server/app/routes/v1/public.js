import { bannerPublicRoutes } from "../../api/banner/routes.js";

export default async function routes(fastify, options) {
  fastify.register(bannerPublicRoutes, { prefix: "banners" });
}
