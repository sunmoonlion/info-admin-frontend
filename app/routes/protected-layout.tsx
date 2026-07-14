import { AppShell } from "~/components/app-shell";
import { RouteErrorBoundary } from "~/components/route-error-boundary";
import { requireUser } from "~/lib/auth";

import type { Route } from "./+types/protected-layout";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  return { user: await requireUser(`${url.pathname}${url.search}`) };
}

export default function ProtectedLayout({ loaderData }: Route.ComponentProps) {
  return <AppShell user={loaderData.user} />;
}

export function ErrorBoundary() {
  return <RouteErrorBoundary />;
}
