<template>
  <div>
    <div v-scrollText="{ delay: 1000, duration: 15000 }" class="mb-3 p-2 border rounded">
      [start]ScrollText是一个滚动指令，这个
      Vue指令被设计用来创建一个水平滚动效果，通常用于滚动文本或图片。它可以通过自定义的持续时间和延迟来控制滚动行为，并且支持反向滚动。这个指令包含了一系列的功能，使得其非常适合用于创建新闻滚动条、公告栏或者图像轮播等效果。滚动效果是通过JS实现，从左滚动到右之后，再从右滚动至左，在滚动开始之前有一个delay，滚动时长可以设置duration[end]
    </div>
    <div v-scrollText class="mb-3">
      [start]默认，不设置delay与duration，ScrollText是一个滚动指令，这个Vue
      指令被设计用来创建一个水平滚动效果，默认，不设置delay与duration。[end]
    </div>
    <div v-scrollText.noreverse class="mb-3">
      [start]noreverse修饰符 + 默认，不设置delay与duration，ScrollText是一个滚动指令，这个
      Vue指令被设计用来创建一个水平滚动效果，当前配置：noreverse修饰符 +
      默认，不设置delay与duration[end]
    </div>
  </div>
</template>

<script setup lang="ts">
definePage({
  meta: {
    title: 'pages.directive.scrollText',
    icon: 'material-symbols-light:swap-horiz'
  }
})
</script>

<style lang="scss" scoped></style>
