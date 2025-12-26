<template>
  <div class="text-xl" v-flash>Coding the world with JavaScript</div>
  <p></p>
  <div class="text-xl">
    <ul class="leading-10" v-flash>
      <li>"困难不是挡在你前进路上的障碍，而是塑造你内心坚韧的机会。"</li>
      <li>"每一天都是新的开始，每一个失败都是成功的踏板。"</li>
      <li>"勇敢是从内心涌现的力量，不是没有恐惧，而是克服恐惧。"</li>
      <li>"相信自己的能力，你可以做到比你想象的更多。"</li>
      <li>"生活不会一帆风顺，但风雨过后，彩虹会出现。"</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
definePage({
  meta: {
    title: 'pages.directive.flash',
    icon: 'la:keyboard'
  }
})

const data = ref<string>('我是被复制的内容')
</script>

<style lang="scss" scoped></style>
