import { Button, Form } from "antd";
import type { FormItemProps, FormProps } from "antd";
import type { NamePath } from "antd/es/form/interface";
import type { ReactNode } from "react";

export interface SchemaField {
  name: NamePath;
  label: ReactNode;
  input: ReactNode;
  rules?: FormItemProps["rules"];
}

export interface SchemaFormProps<Value extends object> {
  fields: readonly SchemaField[];
  onSubmit: (values: Value) => Promise<void> | void;
  submitLabel?: string;
  formProps?: Omit<FormProps<Value>, "children" | "onFinish">;
}

/** Declarative form boundary; domain schemas provide fields and submit adapter. */
export function SchemaForm<Value extends object>({
  fields,
  onSubmit,
  submitLabel = "保存",
  formProps,
}: SchemaFormProps<Value>) {
  return (
    <Form<Value>
      {...formProps}
      onFinish={(values) => void onSubmit(values)}
      layout={formProps?.layout ?? "vertical"}
    >
      {fields.map((field) => (
        <Form.Item key={String(field.name)} name={field.name} label={field.label} rules={field.rules}>
          {field.input}
        </Form.Item>
      ))}
      <Form.Item>
        <Button type="primary" htmlType="submit">
          {submitLabel}
        </Button>
      </Form.Item>
    </Form>
  );
}
