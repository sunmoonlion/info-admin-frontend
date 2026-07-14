import { App as AntApp, Upload } from "antd";
import type { UploadFile, UploadProps } from "antd";
import { useState } from "react";

export interface UploadReceipt {
  assetId: string;
  filename: string;
  size: number;
  url?: string;
}

export interface ContractUploadProps {
  uploadFile: (file: File) => Promise<UploadReceipt>;
  onBeforeUpload?: (file: File) => boolean | Promise<boolean>;
  onUploaded?: (receipt: UploadReceipt) => void;
  accept?: string;
  maxSizeBytes?: number;
  disabled?: boolean;
}

/** Upload adapter boundary; transport/auth stays in the consuming App. */
export function ContractUpload({
  uploadFile,
  onBeforeUpload,
  onUploaded,
  accept,
  maxSizeBytes = 10 * 1024 * 1024,
  disabled = false,
}: ContractUploadProps) {
  const { message } = AntApp.useApp();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const beforeUpload: UploadProps["beforeUpload"] = async (file) => {
    if (file.size > maxSizeBytes) {
      message.error(`文件不能超过 ${Math.round(maxSizeBytes / 1024 / 1024)} MB`);
      return Upload.LIST_IGNORE;
    }
    if (onBeforeUpload) {
      const allowed = await onBeforeUpload(file as File);
      return allowed ? true : Upload.LIST_IGNORE;
    }
    return true;
  };

  const customRequest: NonNullable<UploadProps["customRequest"]> = async (
    options,
  ) => {
    const file = options.file as File;
    try {
      if (!file || typeof file.size !== "number") {
        throw new Error("unsupported upload payload");
      }
      const receipt = await uploadFile(file);
      options.onSuccess?.(receipt);
      onUploaded?.(receipt);
    } catch (error) {
      const uploadError =
        error instanceof Error ? error : new Error("upload failed");
      options.onError?.(uploadError);
    }
  };

  return (
    <Upload
      accept={accept}
      disabled={disabled}
      beforeUpload={beforeUpload}
      customRequest={customRequest}
      fileList={fileList}
      onChange={({ fileList: next }) => setFileList(next.slice(-1))}
      onRemove={() => {
        setFileList([]);
        return true;
      }}
    >
      <span>选择文件</span>
    </Upload>
  );
}
