<template>
  <div class="p-4">
    <el-card header="头像列表">
      <p class="pb-1">头像列表</p>
      <VpAvatarList :images="images" :gutter="10" direction="horizontal"></VpAvatarList>
      <p class="pt-4 pb-1">头像列表 指定数量 不显示多的头像</p>
      <VpAvatarList :images="images" :num="3" :gutter="10" direction="horizontal" :show-more="false"></VpAvatarList>
      <p class="pt-4 pb-1">头像列表inline</p>
      <VpAvatarList :images="images" :gutter="10" direction="horizontal" inline></VpAvatarList>
      <VpAvatarList :images="images" :gutter="10" direction="horizontal" inline></VpAvatarList>
      <p class="pt-4 pb-1">头像列表-设置全部显示</p>
      <VpAvatarList :images="images" :gutter="10" :num="0" direction="horizontal"></VpAvatarList>
      <p class="pt-4 pb-1">头像列表- 设置 reverse - 改变图片的层级</p>
      <VpAvatarList :images="images" :gutter="10" :num="0" direction="horizontal" :reverse="false"></VpAvatarList>
      <p class="pt-4 pb-1">头像列表- 边框大小 与 颜色</p>
      <VpAvatarList :images="images" :gutter="10" :num="0" direction="horizontal" :border-color="'#f56'"
        :border-width="'5px'"></VpAvatarList>
      <p class="pt-4 pb-1">头像列表-垂直显示</p>
      <VpAvatarList :images="images" :gutter="10" :num="3" direction="vertical"></VpAvatarList>
      <p class="pt-4 pb-1">头像列表-垂直inline显示</p>
      <VpAvatarList :images="images" :gutter="10" :num="3" direction="vertical" inline></VpAvatarList>
      <VpAvatarList :images="images" :gutter="10" :num="3" direction="vertical" inline></VpAvatarList>
      <VpAvatarList :images="images" :gutter="10" :num="3" direction="vertical" inline></VpAvatarList>
      <VpAvatarList :images="images" :gutter="10" :num="3" direction="vertical" inline></VpAvatarList>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
definePage({
  meta: {
    title: 'pages.display.avatars',
    icon: 'clarity:users-solid'
  }
})

const modules = import.meta.glob('@/assets/images/headers/**/*.jpeg', {
  eager: true,
  import: 'default'
})

const images = ref([] as string[])
Object.keys(modules).forEach((key) => {
  const mod = modules[key] || ''
  images.value.push(mod as string)
})
</script>

<style scoped></style>
