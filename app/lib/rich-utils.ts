import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEventHandler } from "react";

export function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remaining = safeSeconds % 60;
  const prefix = hours > 0 ? `${String(hours).padStart(2, "0")}:` : "";
  return `${prefix}${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

export function darkenHex(color: string, rate: number): string {
  if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error("color must be #RRGGBB");
  const factor = Math.min(1, Math.max(0, rate));
  const channels = [0, 2, 4].map((offset) =>
    Math.round(parseInt(color.slice(offset + 1, offset + 3), 16) * (1 - factor)),
  );
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

/** Removes control characters before text is copied or rendered in a fixture. */
export function sanitizePlainText(value: string): string {
  return [...value]
    .filter((character) => {
      const code = character.charCodeAt(0);
      return !(
        (code >= 0 && code <= 8) ||
        code === 11 ||
        code === 12 ||
        (code >= 14 && code <= 31) ||
        code === 127
      );
    })
    .join("");
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function useDebouncedCallback<Args extends readonly unknown[]>(
  callback: (...args: Args) => void,
  delay = 300,
) {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);
  const run = useCallback(
    (...args: Args) => {
      cancel();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        callbackRef.current(...args);
      }, Math.max(0, delay));
    },
    [cancel, delay],
  );
  useEffect(() => cancel, [cancel]);
  return { run, cancel };
}

export function useThrottledCallback<Args extends readonly unknown[]>(
  callback: (...args: Args) => void,
  interval = 300,
) {
  const callbackRef = useRef(callback);
  const lastRunRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);
  const run = useCallback(
    (...args: Args) => {
      const now = Date.now();
      const remaining = Math.max(0, interval - (now - lastRunRef.current));
      cancel();
      timerRef.current = setTimeout(() => {
        lastRunRef.current = Date.now();
        timerRef.current = null;
        callbackRef.current(...args);
      }, remaining);
    },
    [cancel, interval],
  );
  useEffect(() => cancel, [cancel]);
  return { run, cancel };
}

export interface LongPressHandlers {
  onPointerDown: PointerEventHandler<HTMLElement>;
  onPointerUp: PointerEventHandler<HTMLElement>;
  onPointerLeave: PointerEventHandler<HTMLElement>;
  onPointerCancel: PointerEventHandler<HTMLElement>;
}

export function useLongPress(
  onLongPress: () => void,
  delay = 800,
): LongPressHandlers {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);
  const onPointerDown = useCallback<PointerEventHandler<HTMLElement>>(() => {
    cancel();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      onLongPress();
    }, Math.max(0, delay));
  }, [cancel, delay, onLongPress]);
  useEffect(() => cancel, [cancel]);
  return {
    onPointerDown,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
  };
}

export interface DraggableOptions {
  initial?: { x: number; y: number };
  bounds?: { width: number; height: number };
  disabled?: boolean;
}

export function useDraggable({
  initial = { x: 0, y: 0 },
  bounds,
  disabled = false,
}: DraggableOptions = {}) {
  const [position, setPosition] = useState(initial);
  const [dragging, setDragging] = useState(false);
  const startRef = useRef<{ x: number; y: number; left: number; top: number } | undefined>(undefined);
  const cleanupRef = useRef<(() => void) | null>(null);
  useEffect(() => () => cleanupRef.current?.(), []);
  const onPointerDown = useCallback<PointerEventHandler<HTMLElement>>(
    (event) => {
      if (disabled || event.button !== 0) return;
      cleanupRef.current?.();
      const element = event.currentTarget;
      startRef.current = {
        x: event.clientX,
        y: event.clientY,
        left: position.x,
        top: position.y,
      };
      element.setPointerCapture?.(event.pointerId);
      setDragging(true);
      const move = (moveEvent: PointerEvent) => {
        const start = startRef.current;
        if (!start) return;
        const next = {
          x: start.left + moveEvent.clientX - start.x,
          y: start.top + moveEvent.clientY - start.y,
        };
        setPosition({
          x: bounds ? Math.min(Math.max(0, next.x), Math.max(0, bounds.width)) : next.x,
          y: bounds ? Math.min(Math.max(0, next.y), Math.max(0, bounds.height)) : next.y,
        });
      };
      const end = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", end);
        startRef.current = undefined;
        cleanupRef.current = null;
        setDragging(false);
      };
      cleanupRef.current = end;
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", end);
    },
    [bounds, disabled, position.x, position.y],
  );
  return { position, dragging, onPointerDown };
}

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<unknown>();
  const copy = useCallback(async (value: string) => {
    setCopied(false);
    setError(undefined);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(sanitizePlainText(value));
      } else {
        const input = document.createElement("textarea");
        input.value = sanitizePlainText(value);
        input.setAttribute("readonly", "true");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.append(input);
        input.select();
        if (!document.execCommand("copy")) throw new Error("copy unavailable");
        input.remove();
      }
      setCopied(true);
    } catch (copyError) {
      setError(copyError);
      throw copyError;
    }
  }, []);
  return { copy, copied, error };
}
