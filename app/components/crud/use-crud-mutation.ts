import { useCallback, useState } from "react";

export type CrudMutationStatus =
  | "idle"
  | "running"
  | "succeeded"
  | "failed";

export interface CrudMutationContext {
  correlationId: string;
  operationId: string;
  reason?: string;
}

export interface CrudMutationSnapshot<Result> {
  status: CrudMutationStatus;
  context?: CrudMutationContext;
  data?: Result;
  error?: unknown;
}

export interface CrudMutationOptions<Result> {
  reason?: string;
  onStateChange?: (
    snapshot: CrudMutationSnapshot<Result>,
  ) => void;
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createCrudMutationContext(reason?: string): CrudMutationContext {
  const normalizedReason = reason?.trim();
  return {
    correlationId: createId(),
    operationId: createId(),
    ...(normalizedReason ? { reason: normalizedReason } : {}),
  };
}

/** Headers are an adapter contract; the consuming App maps them to its BFF. */
export function crudMutationHeaders(
  context: CrudMutationContext,
): Record<string, string> {
  return {
    "X-Correlation-ID": context.correlationId,
    "X-Operation-ID": context.operationId,
    ...(context.reason ? { "X-Audit-Reason": context.reason } : {}),
  };
}

export async function runCrudMutation<Result>(
  mutation: (context: CrudMutationContext) => Promise<Result>,
  options: CrudMutationOptions<Result> = {},
): Promise<Result> {
  const context = createCrudMutationContext(options.reason);
  options.onStateChange?.({ status: "running", context });
  try {
    const data = await mutation(context);
    options.onStateChange?.({ status: "succeeded", context, data });
    return data;
  } catch (error) {
    options.onStateChange?.({ status: "failed", context, error });
    throw error;
  }
}

/**
 * Shared mutation state for audited actions. It never stores credentials or
 * raw server payloads; callers receive only the result they explicitly own.
 */
export function useCrudMutation<Result>(
  mutation: (context: CrudMutationContext) => Promise<Result>,
) {
  const [snapshot, setSnapshot] = useState<CrudMutationSnapshot<Result>>({
    status: "idle",
  });
  const execute = useCallback(
    (options: CrudMutationOptions<Result> = {}) =>
      runCrudMutation(mutation, {
        ...options,
        onStateChange: (next) => {
          setSnapshot(next);
          options.onStateChange?.(next);
        },
      }),
    [mutation],
  );

  return { ...snapshot, execute };
}
