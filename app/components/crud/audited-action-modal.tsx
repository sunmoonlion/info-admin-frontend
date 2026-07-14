import { Form, Input, Modal } from "antd";
import { useEffect } from "react";

interface ReasonValues {
  reason: string;
}

export interface AuditedActionModalProps {
  open: boolean;
  title?: string;
  actionLabel?: string;
  cancelLabel?: string;
  minReasonLength?: number;
  confirming?: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
  onError?: (error: unknown) => void;
}

/** Requires an explicit human reason before a mutating/audited operation. */
export function AuditedActionModal({
  open,
  title = "确认受审计操作",
  actionLabel = "确认",
  cancelLabel = "取消",
  minReasonLength = 5,
  confirming = false,
  onCancel,
  onConfirm,
  onError,
}: AuditedActionModalProps) {
  const [form] = Form.useForm<ReasonValues>();

  useEffect(() => {
    if (!open) form.resetFields();
  }, [form, open]);

  async function handleConfirm() {
    try {
      const values = await form.validateFields();
      await onConfirm(values.reason.trim());
      form.resetFields();
    } catch (error) {
      const isValidationError =
        typeof error === "object" &&
        error !== null &&
        "errorFields" in error;
      if (!isValidationError) onError?.(error);
    }
  }

  return (
    <Modal
      title={title}
      open={open}
      okText={actionLabel}
      cancelText={cancelLabel}
      confirmLoading={confirming}
      onCancel={onCancel}
      onOk={() => void handleConfirm()}
    >
      <Form form={form} layout="vertical" requiredMark>
        <Form.Item
          name="reason"
          label="操作原因"
          rules={[
            { required: true, message: "请输入操作原因" },
            {
              min: minReasonLength,
              message: `请输入至少 ${minReasonLength} 个字符`,
            },
          ]}
        >
          <Input.TextArea
            required
            minLength={minReasonLength}
            rows={4}
            placeholder={`请输入至少 ${minReasonLength} 个字符`}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
