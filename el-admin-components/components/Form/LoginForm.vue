<template>
  <el-tabs v-model="activeName">
    <el-tab-pane label="登录" name="sign">
      <!-- form -->
      <el-form :model="form" class="min-w-[450px]" :rules="rules" ref="formRef">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            :placeholder="$t('pages.login.username')"
            :prefix-icon="getIcon('ep:user')"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            v-model="form.password"
            :placeholder="$t('pages.login.password')"
            :prefix-icon="getIcon('ep:lock')"
          />
        </el-form-item>
        <el-row class="items-center justify-between">
          <el-form-item>
            <el-checkbox :label="$t('pages.login.remember')" v-model="form.remember" name="type" />
          </el-form-item>
          <!-- <el-link type="primary">{{ $t('pages.login.sign-up') }}</el-link> -->
        </el-row>
        <el-form-item>
          <!-- 登录 -->
          <el-button type="primary" @click="onSubmit" class="w-full mt-4">{{
            $t('pages.login.submit')
          }}</el-button>
        </el-form-item>
      </el-form>
      <!-- 第三方登录 -->
      <el-divider direction="horizontal" class="mt-10">
        <span class="text-gray-500">其他登录方式</span>
      </el-divider>
      <div class="flex justify-around">
        <Iconify
          class="text-2xl text-gray-400 cursor-pointer hover:text-[var(--el-color-primary)]"
          :icon="item.icon"
          v-for="(item, index) in loginItems"
          :key="index"
          @click="handleClickItem(item)"
        ></Iconify>
      </div>
    </el-tab-pane>
    <el-tab-pane label="注册" name="reg">
      <!-- form -->
      <el-form :model="form" class="min-w-[450px]" :rules="rules" ref="formRef1">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            :placeholder="$t('pages.login.username')"
            :prefix-icon="getIcon('ep:user')"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            v-model="form.password"
            :placeholder="$t('pages.login.password')"
            :prefix-icon="getIcon('ep:lock')"
          />
        </el-form-item>
        <el-form-item prop="repassword">
          <el-input
            type="password"
            v-model="form.repassword"
            :placeholder="$t('pages.login.repassword')"
            :prefix-icon="getIcon('ep:lock')"
          />
        </el-form-item>
        <el-form-item prop="phone">
          <el-input
            v-model="form.phone"
            :placeholder="$t('pages.login.phone')"
            :prefix-icon="getIcon('ep:phone')"
          />
        </el-form-item>
        <el-form-item prop="code">
          <el-row class="flex-nowrap w-full">
            <el-input
              class="flex-1 mr-3"
              v-model="form.code"
              :placeholder="$t('pages.login.code')"
              :prefix-icon="getIcon('ep:message')"
            />
            <el-button type="primary">发送验证码</el-button>
          </el-row>
        </el-form-item>
        <el-form-item>
          <!-- 注册 -->
          <el-button type="primary" @click="onReg" class="w-full mt-8">
            {{ $t('pages.login.sign-up') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="tsx">
import Iconify from '../Icon/Iconify.vue'
import type { LoginFormProps, LoginItem } from './types'
import type { FormRules } from 'element-plus'
import { $t } from '../../modules/i18n'

withDefaults(defineProps<LoginFormProps>(), {
  title: 'pages.login.welcome'
})

const activeName = ref('sign')

const formRef = ref()
const formRef1 = ref()

const emits = defineEmits(['clickIcon', 'submit', 'reg'])

interface LoginFormInterface {
  username: string
  password: string
  repassword: string
  phone: number | string
  email: string
  code: string
  remember: boolean
}

const form = reactive<LoginFormInterface>({
  username: '',
  password: '',
  repassword: '',
  phone: '',
  email: '',
  code: '',
  remember: false
})

const validatePass = useDebounceFn((rule: any, value: any, callback: any) => {
  if (value.trim() === '') {
    callback(new Error('请输入密码'))
  } else if (value !== form.repassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    // if (ruleForm.checkPass !== '') {
    if (!formRef.value) return
    formRef.value.validateField('repassword', () => null)
    callback()
  }
}, 200)

const validatePass2 = useDebounceFn((rule: any, value: any, callback: any) => {
  if (value.trim() === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    if (!formRef.value) return
    formRef.value.validateField('password', () => null)
    callback()
  }
}, 300)

const rules = reactive<FormRules<LoginFormInterface>>({
  username: [
    {
      required: true,
      message: '用户名不得为空'
    },
    {
      min: 6,
      max: 16,
      message: '用户名格式不正确，最小6位，最长16位'
    }
  ],
  password: [
    {
      min: 6,
      max: 32,
      message: '请输入密码，最小6位，最长32位'
    },
    {
      asyncValidator: validatePass,
      trigger: ['change', 'blur']
    }
  ],
  repassword: [
    {
      min: 6,
      max: 32,
      message: '请再次输入密码'
    },
    {
      asyncValidator: validatePass2,
      trigger: ['change', 'blur']
    }
  ],
  phone: [
    {
      required: true,
      message: '手机号不得为空'
    },
    {
      pattern: /^1[3456789]\d{9}$/,
      message: '请输入正确的手机号'
    }
  ],
  code: [
    {
      required: true,
      message: '验证码不得为空'
    },
    {
      pattern: /^\d{6}$/,
      message: '验证码只能为6位数字',
      trigger: ['change', 'blur']
    }
  ]
})

function getIcon(icon: string) {
  return () => <Iconify icon={icon}></Iconify>
}

const handleClickItem = (item: LoginItem) => {
  emits('clickIcon', item.url)
}

const onSubmit = () => {
  if (formRef.value) {
    formRef.value.validate((valid: any) => {
      if (valid) {
        emits('submit', form)
      }
    })
  }
}

const onReg = () => {
  if (formRef1.value) {
    formRef1.value.validate((valid: any) => {
      if (valid) {
        emits('reg', form)
      }
    })
  }
}
</script>

<style scoped></style>
