import { readFileSync } from "node:fs";

function readProjectFile(path: string): string {
  return readFileSync(`${process.cwd()}/${path}`, "utf8");
}

describe("A2.5 production configuration", () => {
  it("keeps the static deployment security and fallback contract", () => {
    const headers = readProjectFile("mybuild/security-headers.inc");
    const nginx = readProjectFile("mybuild/nginx.conf");
    const dockerfile = readProjectFile("mybuild/Dockerfile");
    expect(headers).toContain("Content-Security-Policy");
    expect(headers).not.toContain("unsafe-eval");
    expect(headers).toContain("object-src 'none'");
    expect(nginx).toContain("location = /health");
    expect(nginx).toContain("try_files $uri $uri/ /index.html");
    expect(nginx).toContain("try_files $uri =404");
    expect(dockerfile).toContain("pnpm lint");
  });

  it("keeps production auth and SPA rendering guards in source", () => {
    expect(readProjectFile("vite.config.ts")).toContain(
      "VITE_AUTH_MODE=demo is forbidden in production builds",
    );
    expect(readProjectFile("react-router.config.ts")).toContain("ssr: false");
    expect(readProjectFile(".env.example")).not.toMatch(/token|password|secret/i);
  });
});
