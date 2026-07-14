/* global console, process */

import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const headers = readFileSync("mybuild/security-headers.inc", "utf8");
const nginx = readFileSync("mybuild/nginx.conf", "utf8");
const dockerfile = readFileSync("mybuild/Dockerfile", "utf8");
const requiredHeaders = [
  "X-Content-Type-Options",
  "X-Frame-Options",
  "Referrer-Policy",
  "Permissions-Policy",
  "Content-Security-Policy",
];
for (const header of requiredHeaders) {
  if (!headers.includes(header)) throw new Error(`missing security header: ${header}`);
}
for (const required of [
  "location = /health",
  "try_files $uri $uri/ /index.html",
  "try_files $uri =404",
]) {
  if (!nginx.includes(required)) throw new Error(`missing nginx gate: ${required}`);
}
if (!dockerfile.includes("pnpm lint")) throw new Error("Docker build must run lint");
if (headers.includes("unsafe-eval")) throw new Error("CSP must not allow unsafe-eval");

try {
  execFileSync("pnpm", ["build"], {
    env: { ...process.env, VITE_AUTH_MODE: "demo" },
    stdio: "pipe",
  });
  throw new Error("demo auth unexpectedly passed a production build");
} catch (error) {
  const output = `${error?.stdout ?? ""}\n${error?.stderr ?? ""}`;
  if (!output.includes("VITE_AUTH_MODE=demo is forbidden")) throw error;
}
console.log(JSON.stringify({ task: "V5-P0-007A2/A2.5", result: "passed" }));
