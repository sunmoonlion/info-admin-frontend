import type { IconProps as IconPropsOrigin } from '@iconify/vue'

export interface IconProps extends /* @vue-ignore */ IconPropsOrigin {}

export interface NetIconProps {
  url: string
  prefix: string
  fontFamily: string
  type: string
}

export interface IconPickerSubmitDataProps {
  icon: string
  color: string
  fontSize: number
}

export interface IconListProps {
  iconData?: string[]
  collection?: string
  itemClass?: string
  iconClass?: string
  activeClass?: string
  showText?: boolean
}
