import { useEffect, useState } from "react";
import { useReducedMotion } from "~/lib/rich-utils";

export interface AutoScrollTextProps {
  children: React.ReactNode;
  durationMs?: number;
  delayMs?: number;
}

export function AutoScrollText({
  children,
  durationMs = 10000,
  delayMs = 2000,
}: AutoScrollTextProps) {
  const reducedMotion = useReducedMotion();
  return (
    <div
      className="rich-scroll-text"
      style={{
        "--rich-scroll-duration": `${Math.max(100, durationMs)}ms`,
        "--rich-scroll-delay": `${Math.max(0, delayMs)}ms`,
        animationPlayState: reducedMotion ? "paused" : "running",
      } as React.CSSProperties}
      title={typeof children === "string" ? children : undefined}
    >
      <span>{children}</span>
    </div>
  );
}

export interface TypingTextProps {
  text: string;
  intervalMs?: number;
}

export function TypingText({ text, intervalMs = 70 }: TypingTextProps) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState("");
  useEffect(() => {
    if (reducedMotion) return;
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setVisible(text.slice(0, index));
      if (index >= text.length) window.clearInterval(timer);
    }, Math.max(1, intervalMs));
    return () => window.clearInterval(timer);
  }, [intervalMs, reducedMotion, text]);
  return <span aria-live="polite">{reducedMotion ? text : visible}</span>;
}
