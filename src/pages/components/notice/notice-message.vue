<template>
  <div class="ml-5">
    <VpNotice :actions="actions" :lists="lists" wrap-class="w-[300px]" @click-item="handleClickItem"></VpNotice>
    <VpNotification value="100232" :scale="scale"></VpNotification>
    <p></p>
    <p></p>
    <p></p>
    <p></p>
    {{ scale }}
    <button @click="scale = 1">click 1</button>
    <button @click="scale = 0.5">click 0.5</button>
    <button @click="scale = 1.5">click 1.5</button>
  </div>
</template>

<script setup lang="ts">
import type { VpNoticeActionsItem, VpNoticeMessageListOptions } from 'el-admin-components'

definePage({
  meta: {
    title: 'pages.head-message',
    icon: 'mdi:message'
  }
})

const scale = ref(0.5)

const actions = ref<VpNoticeActionsItem[]>([
  {
    title: '清空',
    icon: 'ep:delete',
    click: () => console.log('清空')
  },
  {
    title: '更多',
    icon: 'ep:more',
    click: () => console.log('更多')
  }
])

const lists = ref<VpNoticeMessageListOptions[]>([
  {
    title: '通知',
    contents: [
      {
        title: '消息1',
        avatar: { src: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png' },
        content: '消息内容1',
        time: '2022-01-03 14:55:33',
        tagProps: { type: 'danger' },
        tag: '紧急'
      },
      {
        title: '消息1',
        avatar: { src: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png' },
        content: '消息内容1',
        time: '2022-01-02 14:55:33'
      },
      {
        title: '消息1',
        avatar: { src: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png' },
        content: '消息内容1',
        time: '2022-01-01 14:55:33'
      }
    ]
  },
  {
    title: '关注',
    contents: [
      {
        title: '消息3',
        avatar: { src: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png' },
        content: '消息内容3',
        time: '2022-01-02 14:55:33',
        tagProps: { type: 'info' },
        tag: '通知'
      },
      {
        title: '消息3',
        avatar: { src: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png' },
        content: '消息内容3',
        time: '2022-01-01 14:55:33'
      }
    ]
  },
  {
    title: '待办',
    contents: [
      {
        title: '消息2',
        avatar: { src: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png' },
        content: '消息内容2',
        time: '2022-01-02 14:55:33',
        tagProps: { type: 'info' },
        tag: '通知'
      },
      {
        title: '消息2',
        avatar: { src: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png' },
        content: '消息内容2',
        time: '2022-01-01 14:55:33'
      }
    ]
  }
])

const handleClickItem = (item: any) => {
  console.log('🚀 ~ file: VpNotice-message.vue:100 ~ handleClickItem ~ item:', item)
}
</script>

<style scoped></style>
