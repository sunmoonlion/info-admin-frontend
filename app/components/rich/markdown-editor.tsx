import { Input } from "antd";
import type { TextAreaProps } from "antd/es/input";
import { sanitizePlainText } from "~/lib/rich-utils";

export interface MarkdownEditorProps extends Omit<TextAreaProps, "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  showPreview?: boolean;
}

/** Safe markdown boundary: edit and display plain text; no HTML is injected. */
export function MarkdownEditor({
  value,
  onChange,
  label = "Markdown 内容",
  showPreview = true,
  id = "markdown-editor",
  ...props
}: MarkdownEditorProps) {
  const safeValue = sanitizePlainText(value);
  return (
    <section className="rich-editor" aria-labelledby={`${id}-label`}>
      <label id={`${id}-label`} htmlFor={id}>{label}</label>
      <Input.TextArea
        {...props}
        id={id}
        value={safeValue}
        onChange={(event) => onChange(sanitizePlainText(event.target.value))}
        aria-describedby={showPreview ? `${id}-preview` : undefined}
      />
      {showPreview && (
        <output id={`${id}-preview`} className="rich-editor-preview" aria-label="Markdown 预览">
          <pre>{safeValue || "暂无内容"}</pre>
        </output>
      )}
    </section>
  );
}
