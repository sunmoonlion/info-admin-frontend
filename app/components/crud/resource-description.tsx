import { Descriptions, Empty } from "antd";
import type { DescriptionsProps } from "antd";

export interface ResourceDescriptionProps
  extends Omit<DescriptionsProps, "items"> {
  items?: DescriptionsProps["items"];
  emptyText?: string;
}

/** A consistent, read-only detail presentation for any resource DTO. */
export function ResourceDescription({
  items,
  emptyText = "暂无详情",
  ...props
}: ResourceDescriptionProps) {
  if (!items?.length) return <Empty description={emptyText} />;
  return <Descriptions {...props} items={items} />;
}
