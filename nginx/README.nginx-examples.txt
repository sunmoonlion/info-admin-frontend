Admin: JS module got text/html

- Dev index uses /src/main.ts. Only Vite dev server can serve it.
- Nginx static root + SPA try_files -> index.html for every missing path -> MIME error.

Fix dev: pnpm dev -- --host 0.0.0.0 --port 5173, browse :5173, or proxy_pass to 5173.

Fix prod: pnpm build, nginx root = dist (not repo root).

docker-compose: volume should be dist after build, not source tree.
