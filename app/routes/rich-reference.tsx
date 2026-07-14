import { Button, Card, Space, Typography } from "antd";
import { useState } from "react";

import {
  AppIcon,
  AutoScrollText,
  AvatarList,
  AvatarMenu,
  CollapseSection,
  MarkdownEditor,
  MediaPlayer,
  MetricChart,
  ProgressIndicator,
  TypingText,
  Watermark,
} from "~/components/rich";
import { useCopyToClipboard } from "~/lib/rich-utils";
import { appConfig } from "~/lib/config";

export function meta() {
  return [{ title: `富组件与工具参考 · ${appConfig.name}` }];
}

export default function RichReferencePage() {
  const [markdown, setMarkdown] = useState("# 安全的 Markdown\n\n模板只展示纯文本预览。");
  const { copy, copied } = useCopyToClipboard();
  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <Typography.Text type="secondary">Rich / Utility Reference</Typography.Text>
          <Typography.Title level={1}>富组件与通用工具参考页</Typography.Title>
          <Typography.Paragraph type="secondary">
            所有内容均为中性 fixture；业务 App 通过 adapter 注入真实数据和 transport。
          </Typography.Paragraph>
        </div>
        <AvatarMenu
          username="Template User"
          items={[{ key: "settings", label: "设置" }, "divider", { key: "logout", label: "退出" }]}
        />
      </header>

      <Card title="Icon / Avatar / Copy">
        <Space wrap>
          <AppIcon name="home" label="首页图标" />
          <AppIcon name="unknown" label="安全回退图标" />
          <AvatarList
            items={[{ id: "one", label: "One" }, { id: "two", label: "Two" }, { id: "three", label: "Three" }]}
            onSelect={(item) => void copy(item.id)}
          />
          <Button onClick={() => void copy("fixture-correlation-id")}>
            {copied ? "已复制" : "复制 fixture"}
          </Button>
        </Space>
      </Card>

      <Card title="Chart / Progress / Transition">
        <MetricChart title="Fixture throughput" data={[{ label: "一", value: 8 }, { label: "二", value: 13 }, { label: "三", value: 5 }]} />
        <ProgressIndicator label="Fixture progress" value={68} />
        <CollapseSection title="展开中性详情">
          <Typography.Paragraph>折叠内容保持键盘和原生 details 语义。</Typography.Paragraph>
        </CollapseSection>
      </Card>

      <Card title="Editor / Media">
        <MarkdownEditor value={markdown} onChange={setMarkdown} />
        <MediaPlayer kind="audio" src="/fixtures/audio.mp3" title="Fixture audio" />
      </Card>

      <Watermark text="INTERNAL FIXTURE">
        <Card title="Watermark / Text effects">
          <AutoScrollText>这是一个可暂停动画的中性文本。</AutoScrollText>
          <TypingText text="无业务含义的打字效果" />
        </Card>
      </Watermark>
    </section>
  );
}
