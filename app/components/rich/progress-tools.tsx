import { Progress } from "antd";
import { useReducedMotion } from "~/lib/rich-utils";

export interface ProgressIndicatorProps {
  value: number;
  label: string;
  status?: "normal" | "exception" | "success";
}

export function ProgressIndicator({ value, label, status = "normal" }: ProgressIndicatorProps) {
  const reducedMotion = useReducedMotion();
  return (
    <div role="group" aria-label={label} className="rich-progress">
      <Progress percent={Math.min(100, Math.max(0, value))} status={status} showInfo />
      {!reducedMotion && <span className="visually-hidden">动画已启用</span>}
    </div>
  );
}

export interface CollapseSectionProps {
  title: string;
  open?: boolean;
  children: React.ReactNode;
}

export function CollapseSection({ title, open = false, children }: CollapseSectionProps) {
  return (
    <details open={open} className="rich-collapse">
      <summary>{title}</summary>
      <div>{children}</div>
    </details>
  );
}

export interface WatermarkProps {
  text: string;
  children: React.ReactNode;
}

export function Watermark({ text, children }: WatermarkProps) {
  const safeText = text.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[character] ?? character);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='140'><text x='10' y='70' fill='rgba(120,120,120,.18)' transform='rotate(-20 10 70)'>${safeText}</text></svg>`;
  const background = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  return <div className="rich-watermark" style={{ backgroundImage: background }}>{children}</div>;
}
