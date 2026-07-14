import { App as AntApp } from "antd";

export function useCrudNotifications() {
  const { notification } = AntApp.useApp();

  return {
    success(message: string, description?: string) {
      notification.success({ title: message, description });
    },
    error(message = "操作失败", description?: string) {
      notification.error({ title: message, description });
    },
    info(message: string, description?: string) {
      notification.info({ title: message, description });
    },
  };
}
