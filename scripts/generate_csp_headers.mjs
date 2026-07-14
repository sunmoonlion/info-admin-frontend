/* global console */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const indexPath = "build/client/index.html";
const fallbackHeadersPath = "mybuild/security-headers.inc";
const outputPath = "build/security-headers.inc";
const html = readFileSync(indexPath, "utf8");
const fallbackHeaders = readFileSync(fallbackHeadersPath, "utf8");
const inlineScripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
  .map((match) => match[1])
  .filter((content) => content.length > 0);

if (inlineScripts.length === 0) {
  throw new Error(`no inline scripts found in ${indexPath}; refusing unsafe CSP fallback`);
}

const hashes = inlineScripts.map(
  (content) =>
    `'sha256-${createHash("sha256").update(content, "utf8").digest("base64")}'`,
);
const generatedHeaders = fallbackHeaders.replace(
  /script-src 'self'/,
  `script-src 'self' ${hashes.join(" ")}`,
);

if (generatedHeaders === fallbackHeaders) {
  throw new Error("fallback CSP is missing the script-src 'self' anchor");
}

writeFileSync(outputPath, generatedHeaders);
console.log(
  JSON.stringify({
    output: outputPath,
    inline_script_count: inlineScripts.length,
    hash_count: hashes.length,
  }),
);
