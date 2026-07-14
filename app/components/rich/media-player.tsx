import { Alert } from "antd";
import { useMemo, useState } from "react";

function resolveMediaUrl(src: string): string {
  if (src.startsWith("/") && !src.startsWith("//")) return src;
  if (typeof window === "undefined") throw new Error("media URL requires a relative path");
  const resolved = new URL(src, window.location.origin);
  if (resolved.origin !== window.location.origin || !["http:", "https:"].includes(resolved.protocol)) {
    throw new Error("media URL must be same-origin");
  }
  return resolved.toString();
}

export interface MediaPlayerProps {
  src: string;
  kind?: "audio" | "video";
  title: string;
  controls?: boolean;
  poster?: string;
}

export function MediaPlayer({
  src,
  kind = "audio",
  title,
  controls = true,
  poster,
}: MediaPlayerProps) {
  const [failed, setFailed] = useState(false);
  const safeSrc = useMemo(() => {
    try { return resolveMediaUrl(src); } catch { return undefined; }
  }, [src]);
  if (!safeSrc) return <Alert type="error" title="媒体地址不安全或无效" />;
  if (failed) return <Alert type="error" title="媒体加载失败" />;
  if (kind === "video") {
    return <video className="rich-media" src={safeSrc} poster={poster} controls={controls} aria-label={title} onError={() => setFailed(true)} />;
  }
  return <audio className="rich-media" src={safeSrc} controls={controls} aria-label={title} onError={() => setFailed(true)} />;
}
