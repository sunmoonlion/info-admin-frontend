import { App as AntApp } from "antd";

export function useCrudNotifications() {
  const { notification } = AntApp.useApp();

  return {
    success(message: string, description?: string) {
      notification.success({ message, description });
    },
    error(message = "操作失败", description?: string) {
      notification.error({ message, description });
    },
    info(message: string, description?: string) {
      notification.info({ message, description });
    },
  };
}
