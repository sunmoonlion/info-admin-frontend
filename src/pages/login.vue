<template>
  <div class="login-wrap">
    <div class="login-card">
      <h2 class="title">欢迎回来</h2>
      <p class="subtitle">使用 Casdoor 单点登录</p>
      <button class="sso-btn" @click="handleSubmit">使用 Casdoor 登录</button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePage({
  meta: {
    title: '登录',
    hideMenu: false,
    order: 5,
    icon: 'mdi:login',
    layout: 'single-page',
    position: 'right',
    backgroundImage: 'https://cdn.pixabay.com/photo/2022/11/03/15/24/coffee-7567749_1280.jpg'
  }
})

const handleSubmit = () => {
  window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/login`
}
</script>

<style scoped>
.login-wrap {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 360px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  padding: 24px;
  text-align: center;
}

.title {
  margin: 0 0 8px;
  font-size: 28px;
}

.subtitle {
  margin: 0 0 18px;
  color: #6b7280;
}

.sso-btn {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 6px;
  background: #1677ff;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
}
</style>
