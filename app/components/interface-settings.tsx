import { ColorPicker, Drawer, Form, Radio, Switch, Typography } from "antd";

import { useLocale } from "~/lib/i18n";
import { useUiStore } from "~/store/ui";

interface InterfaceSettingsProps {
  open: boolean;
  onClose: () => void;
}

export function InterfaceSettings({ open, onClose }: InterfaceSettingsProps) {
  const { t } = useLocale();
  const {
    density,
    locale,
    showBreadcrumb,
    showTabs,
    themeColor,
    themeMode,
    setDensity,
    setLocale,
    setShowBreadcrumb,
    setShowTabs,
    setThemeColor,
    setThemeMode,
  } = useUiStore();

  return (
    <Drawer
      title={t("settings")}
      open={open}
      onClose={onClose}
      size={360}
      destroyOnHidden
    >
      <Typography.Paragraph type="secondary">
        {t("settingsDescription")}
      </Typography.Paragraph>
      <Form layout="vertical" className="interface-settings-form">
        <Form.Item label={t("theme")}>
          <Radio.Group
            value={themeMode}
            onChange={(event) => setThemeMode(event.target.value)}
            optionType="button"
            buttonStyle="solid"
            options={[
              { label: t("themeLight"), value: "light" },
              { label: t("themeDark"), value: "dark" },
              { label: t("themeSystem"), value: "system" },
            ]}
          />
        </Form.Item>
        <Form.Item label={t("primaryColor")}>
          <ColorPicker
            value={themeColor}
            showText
            onChangeComplete={(color) => setThemeColor(color.toHexString())}
          />
        </Form.Item>
        <Form.Item label={t("density")}>
          <Radio.Group
            value={density}
            onChange={(event) => setDensity(event.target.value)}
            optionType="button"
            buttonStyle="solid"
            options={[
              { label: t("densityComfortable"), value: "comfortable" },
              { label: t("densityCompact"), value: "compact" },
            ]}
          />
        </Form.Item>
        <Form.Item label={t("language")}>
          <Radio.Group
            value={locale}
            onChange={(event) => setLocale(event.target.value)}
            optionType="button"
            buttonStyle="solid"
            options={[
              { label: "中文", value: "zh-CN" },
              { label: "English", value: "en" },
            ]}
          />
        </Form.Item>
        <Form.Item label={t("navigationDisplay")}>
          <div className="settings-switch-row">
            <span>{t("showTabs")}</span>
            <Switch checked={showTabs} onChange={setShowTabs} />
          </div>
          <div className="settings-switch-row">
            <span>{t("showBreadcrumb")}</span>
            <Switch checked={showBreadcrumb} onChange={setShowBreadcrumb} />
          </div>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
