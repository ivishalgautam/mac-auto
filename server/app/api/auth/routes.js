"use strict";
import controller from "./controller.js";
import userController from "../users/controller.js";

export default async function routes(fastify, options) {
  fastify.addHook("preHandler", async (request, reply) => {
    request.body && console.log("body", request.body);
  });
  fastify.post("/login", {}, controller.verifyUserCredentials);
  fastify.post("/login-request", {}, controller.loginRequest);
  fastify.post("/login-verify", {}, controller.loginVerify);
  fastify.post("/register-request", {}, controller.registerRequest);
  fastify.post("/register-verify", {}, controller.registerVerify);
  fastify.post("/refresh", {}, controller.verifyRefreshToken);
  fastify.post("/username", {}, userController.checkUsername);
  fastify.post("/:token", {}, userController.resetPassword);
}
