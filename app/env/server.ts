import 'server-only'

import { parseServerEnv } from './server-schema'

export const serverEnv = parseServerEnv(
  {
    NODE_ENV: process.env.NODE_ENV,
    DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV,
    AUTH_APP: process.env.AUTH_APP,
    APP_ORIGIN: process.env.APP_ORIGIN,
    ADMIN_BACKEND_INTERNAL_URL: process.env.ADMIN_BACKEND_INTERNAL_URL,
    DEPLOYMENT_ID: process.env.DEPLOYMENT_ID,
  },
  {
    phase: process.env.NEXT_PHASE,
  },
)

export type { ServerEnv } from './server-schema'
