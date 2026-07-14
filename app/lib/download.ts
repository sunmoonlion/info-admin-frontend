export function downloadBlob(blob: Blob, filename: string) {
  if (typeof document === "undefined") return;
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

export function sameOriginDownloadUrl(url: string, origin?: string) {
  const currentOrigin =
    origin ?? (typeof window === "undefined" ? "" : window.location.origin);
  if (!currentOrigin) throw new Error("download origin is unavailable");
  const resolved = new URL(url, currentOrigin);
  if (resolved.origin !== currentOrigin) {
    throw new Error("download URL must use the current origin");
  }
  return resolved.toString();
}
