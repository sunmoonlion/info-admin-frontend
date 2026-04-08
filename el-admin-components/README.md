# el-admin-components (Local Workspace Package)

This folder is used as a local source package in `tpl-admin-frontend`.

## Goal

Use local source code directly (editable), instead of consuming `el-admin-components` from npm registry.

## Current setup (this project)

- `el-admin-components/package.json` exists (local package manifest)
- root `package.json` uses:
  - `"el-admin-components": "workspace:*"`
- root `pnpm-workspace.yaml` includes:
  - `.`
  - `el-admin-components`

## Run

From `tpl-admin-frontend` root:

```bash
pnpm install
pnpm dev --host --port 5173 --force
```

## Reuse in a new project

1. Copy this folder to new project root:
   - `el-admin-components/`
2. In new project root `package.json`, add dependency:
   - `"el-admin-components": "workspace:*"`
3. Add `pnpm-workspace.yaml` in new project root:

```yaml
packages:
  - .
  - el-admin-components
```

4. Install dependencies:

```bash
pnpm install
```

If you do not use pnpm workspace, you can use:

- `"el-admin-components": "file:./el-admin-components"`

## Import usage

Keep using standard imports:

- `import { globalPlugin } from 'el-admin-components'`
- `import { VpLoginForm } from 'el-admin-components'`
- Vue components keep `Vp` prefix naming convention

## Notes

- If startup fails, run with force once:

```bash
pnpm dev --host --port 5173 --force
```

- If port 5173 is occupied, stop existing process then restart.

- Keep this package local-first. Do not switch back to registry version unless you intentionally want to stop local source editing.
