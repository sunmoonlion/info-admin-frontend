export const queryKeys = {
  session: ["auth", "session"] as const,
  resource: (name: string, scope = "default") =>
    ["resource", name, scope] as const,
} as const;
