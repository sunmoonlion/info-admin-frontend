<template>
  <div>
    <div>menu1-1</div>
    <div>下面是路由menu1-1的子路由：router-view</div>
    <router-view></router-view>
  </div>
</template>

<script lang="ts" setup>
definePage({
  meta: {
    title: 'pages.menu.menu1-1',
    icon: 'healthicons:2'
  }
})
</script>
