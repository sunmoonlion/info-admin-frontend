import { reactRouter } from "@react-router/dev/vite";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (command === "build" && env.VITE_AUTH_MODE === "demo") {
    throw new Error("VITE_AUTH_MODE=demo is forbidden in production builds");
  }
  const configuredBasePath = env.BASE_PATH?.trim() || "/";
  const basename =
    configuredBasePath === "/"
      ? "/"
      : `/${configuredBasePath.replace(/^\/+|\/+$/g, "")}`;

  return {
    base: basename === "/" ? "/" : `${basename}/`,
    plugins: [reactRouter(), tsconfigPaths()],
    server: { host: true },
    preview: { host: true },
  };
});
