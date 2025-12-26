<template>
  <div>
    <VpAudioPlayer :title="title" :options="options" ref="audioRef" @next="handleNext" @prev="handlePrev"
      @mode="handleMode"></VpAudioPlayer>
  </div>
</template>

<script setup lang="ts">
import type { VpAudioPlayerOptions, VpAudioPlayerMethods } from 'el-admin-components'
// import { useAudioPlayer } from 'el-admin-components'
// import { Howler } from 'howler'

definePage({
  meta: {
    title: 'components.audio-player',
    icon: 'ant-design:audio-outlined'
  }
})

const audioRef = ref<VpAudioPlayerMethods>()
const title = ref('')

// 音乐列表
const lists = ref([
  {
    src: 'https://example.com/music/sample1.mp3',
    title:
      '如愿 - Cover王菲,如愿 - Cover王菲如愿 - Cover王菲如愿 - Cover王菲如愿 - Cover王菲如愿 - Cove.. - Co----123123123'
  },
  {
    src: 'https://example.com/music/sample2.mp3',
    title:
      '孤勇者 - Cover陈奕迅孤勇者 - Cover陈奕迅孤勇者 - Cover陈奕迅孤勇者 - Cover陈奕迅1111_____-孤勇者 - Cover陈奕迅孤勇者 - Cover陈奕迅孤勇者 - Cover陈奕迅'
  },
  {
    src: 'https://example.com/music/sample3.mp3',
    title: '爱你 - 王心凌'
  },
  {
    src: 'https://example.com/music/sample4.mp3',
    title: '青鸟（ブルーバード） - 生物股长'
  },
  {
    src: 'https://example.com/music/sample5.mp3',
    title: '光辉岁月 - Beyond'
  }
])

const options = ref({
  src: ''
} as VpAudioPlayerOptions)

const { current, handleMode, handleNext, handlePrev } = useAudioPlayer(lists.value)

watch(
  current,
  (newVal: number) => {
    options.value.src = lists.value[newVal || 0].src
    title.value = lists.value[newVal || 0].title
  },
  {
    immediate: true
  }
)
</script>

<style scoped></style>
