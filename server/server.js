import registerPlugins from "./app/plugins/index.js";

export default async function (app) {
  await registerPlugins(app);
}
