<template>
  <LoginForm :login-items="loginItems" @submit="handleSubmit"></LoginForm>
</template>

<script setup lang="tsx">
definePage({
  meta: {
    title: '欢迎 回来',
    hideMenu: true,
    layout: 'single-page',
    position: 'right',
    backgroundImage: 'https://cdn.pixabay.com/photo/2022/11/03/15/24/coffee-7567749_1280.jpg'
    // backgroundImage: 'https://cdn.pixabay.com/photo/2022/01/20/17/51/office-desk-6952919_1280.jpg'
  }
})

const loginItems = [
  {
    icon: 'ic:baseline-wechat',
    url: ''
  },
  {
    icon: 'cib:tencent-qq',
    url: ''
  },
  {
    icon: 'bi:sina-weibo',
    url: ''
  },
  {
    icon: 'mdi:github',
    url: ''
  }
]

const handleSubmit = () => {
  // 跳转到后端 BFF 的 OIDC 登录入口，由后端负责与 Casdoor 交互
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/login`
}
</script>

<style scoped></style>
