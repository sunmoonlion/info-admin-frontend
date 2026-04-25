
import type { App } from 'vue'
import { setupDirectives } from './directives'
export { setupDirectives }

// append-by-scripts
import AvatarList from './components/Avatar/AvatarList.vue'
import AvatarMenu from './components/Avatar/AvatarMenu.vue'
import Charts from './components/Charts/Charts.vue'
import VueEcharts from './components/Charts/VueEcharts.vue'
import Description from './components/Description/Description.vue'
import Editor from './components/Edtior/Editor.vue'
import Form from './components/Form/Form.vue'
import FormItem from './components/Form/FormItem.vue'
import FormLayout from './components/Form/FormLayout.vue'
import FormLayoutSchema from './components/Form/FormLayoutSchema.vue'
import LoginForm from './components/Form/LoginForm.vue'
import IconList from './components/Icon/IconList.vue'
import IconPicker from './components/Icon/IconPicker.vue'
import IconfontIcon from './components/Icon/IconfontIcon.vue'
import Iconify from './components/Icon/Iconify.vue'
import NetIcon from './components/Icon/NetIcon.vue'
import SvgIcon from './components/Icon/SvgIcon.vue'
import Header from './components/Layouts/Header.vue'
import HeaderTabs from './components/Layouts/HeaderTabs.vue'
import DropDown from './components/Menu/DropDown.vue'
import Menu from './components/Menu/Menu.vue'
import MenuItem from './components/Menu/MenuItem.vue'
import SubMenu from './components/Menu/SubMenu.vue'
import Notice from './components/Notice/Notice.vue'
import NoticeMessageList from './components/Notice/NoticeMessageList.vue'
import Notification from './components/Notice/Notification.vue'
import AudioPlayer from './components/Player/AudioPlayer.vue'
import VideoPlayer from './components/Player/VideoPlayer.vue'
import ProgressBar from './components/Slide/ProgressBar.vue'
import DragIcon from './components/Table/DragIcon.vue'
import Table from './components/Table/Table.vue'
import TableColumn from './components/Table/TableColumn.vue'
import Breadcrumb from './components/Themes/Breadcrumb.vue'
import ChangeLocale from './components/Themes/ChangeLocale.vue'
import DarkModeToggle from './components/Themes/DarkModeToggle.vue'
import FullScreen from './components/Themes/FullScreen.vue'
import ThemeSettings from './components/Themes/ThemeSettings.vue'
import CollapseTransition from './components/Transition/CollapseTransition.vue'

import VpDirectiveCopy from './directives/modules/copy'
import VpDirectiveDebounce from './directives/modules/debounce'
import VpDirectiveDraggable from './directives/modules/draggable'
import VpDirectiveFlash from './directives/modules/flash'
import VpDirectiveLongPress from './directives/modules/longPress'
import VpDirectiveScrollText from './directives/modules/scrollText'
import VpDirectiveThrottle from './directives/modules/throttle'
import VpDirectiveWaterMarker from './directives/modules/waterMarker'

export const globalPlugin = {
  install(app: App) {
    app.component('VpAvatarList', AvatarList)
    app.component('VpAvatarMenu', AvatarMenu)
    app.component('VpCharts', Charts)
    app.component('VpVueEcharts', VueEcharts)
    app.component('VpDescription', Description)
    app.component('VpEditor', Editor)
    app.component('VpForm', Form)
    app.component('VpFormItem', FormItem)
    app.component('VpFormLayout', FormLayout)
    app.component('VpFormLayoutSchema', FormLayoutSchema)
    app.component('VpLoginForm', LoginForm)
    app.component('VpIconList', IconList)
    app.component('VpIconPicker', IconPicker)
    app.component('VpIconfontIcon', IconfontIcon)
    app.component('VpIconify', Iconify)
    app.component('VpNetIcon', NetIcon)
    app.component('VpSvgIcon', SvgIcon)
    app.component('VpHeader', Header)
    app.component('VpHeaderTabs', HeaderTabs)
    app.component('VpDropDown', DropDown)
    app.component('VpMenu', Menu)
    app.component('VpMenuItem', MenuItem)
    app.component('VpSubMenu', SubMenu)
    app.component('VpNotice', Notice)
    app.component('VpNoticeMessageList', NoticeMessageList)
    app.component('VpNotification', Notification)
    app.component('VpAudioPlayer', AudioPlayer)
    app.component('VpVideoPlayer', VideoPlayer)
    app.component('VpProgressBar', ProgressBar)
    app.component('VpDragIcon', DragIcon)
    app.component('VpTable', Table)
    app.component('VpTableColumn', TableColumn)
    app.component('VpBreadcrumb', Breadcrumb)
    app.component('VpChangeLocale', ChangeLocale)
    app.component('VpDarkModeToggle', DarkModeToggle)
    app.component('VpFullScreen', FullScreen)
    app.component('VpThemeSettings', ThemeSettings)
    app.component('VpCollapseTransition', CollapseTransition)
  }
}

export default globalPlugin
export {
  AvatarList as VpAvatarList,
  AvatarMenu as VpAvatarMenu,
  Charts as VpCharts,
  VueEcharts as VpVueEcharts,
  Description as VpDescription,
  Editor as VpEditor,
  Form as VpForm,
  FormItem as VpFormItem,
  FormLayout as VpFormLayout,
  FormLayoutSchema as VpFormLayoutSchema,
  LoginForm as VpLoginForm,
  IconList as VpIconList,
  IconPicker as VpIconPicker,
  IconfontIcon as VpIconfontIcon,
  Iconify as VpIconify,
  NetIcon as VpNetIcon,
  SvgIcon as VpSvgIcon,
  Header as VpHeader,
  HeaderTabs as VpHeaderTabs,
  DropDown as VpDropDown,
  Menu as VpMenu,
  MenuItem as VpMenuItem,
  SubMenu as VpSubMenu,
  Notice as VpNotice,
  NoticeMessageList as VpNoticeMessageList,
  Notification as VpNotification,
  AudioPlayer as VpAudioPlayer,
  VideoPlayer as VpVideoPlayer,
  ProgressBar as VpProgressBar,
  DragIcon as VpDragIcon,
  Table as VpTable,
  TableColumn as VpTableColumn,
  Breadcrumb as VpBreadcrumb,
  ChangeLocale as VpChangeLocale,
  DarkModeToggle as VpDarkModeToggle,
  FullScreen as VpFullScreen,
  ThemeSettings as VpThemeSettings,
  CollapseTransition as VpCollapseTransition,
  VpDirectiveCopy,
  VpDirectiveDebounce,
  VpDirectiveDraggable,
  VpDirectiveFlash,
  VpDirectiveLongPress,
  VpDirectiveScrollText,
  VpDirectiveThrottle,
  VpDirectiveWaterMarker
}

export { useForm } from './components/Form/useForm'
export { useMenu } from './components/Menu/useMenu'
export { useAudioPlayer } from './components/Player/useAudioPlayer'
export { useDrag } from './components/Table/hooks/useDrag'
export * from './components-types'
