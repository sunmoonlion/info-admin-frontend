import { Avatar, Dropdown, Space } from "antd";
import type { MenuProps } from "antd";
import { useMemo } from "react";

export interface AvatarItem {
  id: string;
  src?: string;
  label?: string;
}

export interface AvatarListProps {
  items: readonly AvatarItem[];
  max?: number;
  size?: number;
  onSelect?: (item: AvatarItem, index: number) => void;
}

export function AvatarList({
  items,
  max = 5,
  size = 32,
  onSelect,
}: AvatarListProps) {
  const visible = items.slice(0, Math.max(0, max));
  const remaining = Math.max(0, items.length - visible.length);
  return (
    <ul aria-label="头像列表" className="rich-avatar-list">
      {visible.map((item, index) => (
        <li key={item.id}>
          <button
            type="button"
            className="rich-avatar-button"
            aria-label={item.label ?? item.id}
            onClick={() => onSelect?.(item, index)}
          >
            <Avatar src={item.src} size={size} alt={item.label ?? item.id}>
              {(item.label ?? item.id).slice(0, 1).toUpperCase()}
            </Avatar>
          </button>
        </li>
      ))}
      {remaining > 0 && <li aria-label={`还有 ${remaining} 个头像`}>+{remaining}</li>}
    </ul>
  );
}

export interface AvatarMenuProps {
  username?: string;
  src?: string;
  items: readonly (string | { key: string; label: string } | "divider")[];
  onCommand?: (key: string) => void;
}

export function AvatarMenu({
  username,
  src,
  items,
  onCommand,
}: AvatarMenuProps) {
  const menuItems = useMemo<MenuProps["items"]>(
    () =>
      items.map((item) =>
        item === "divider"
          ? { type: "divider" as const }
          : typeof item === "string"
            ? { key: item, label: item }
            : { key: item.key, label: item.label },
      ),
    [items],
  );
  return (
    <Dropdown
      trigger={["click"]}
      menu={{
        items: menuItems,
        onClick: ({ key }) => onCommand?.(key),
      }}
    >
      <button type="button" className="rich-avatar-menu" aria-label="用户菜单">
        <Space>
          <Avatar src={src} alt={username ?? "用户"}>
            {(username ?? "U").slice(0, 1).toUpperCase()}
          </Avatar>
          {username && <span>{username}</span>}
        </Space>
      </button>
    </Dropdown>
  );
}
