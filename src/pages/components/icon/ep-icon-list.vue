<!-- 所有的Element-plus的Icon，类似于elemeninfous的icon列表 -->
<template>
  <div class="mb-2 flex justify-end items-center w-full">
    <div class="mr-4">
      <el-checkbox v-model="copyIconComponentFlag" label="复制Icon组件" size="large" />
    </div>
    <div class="mr-4">
      <el-switch v-model="copyTypeFlag" active-text="复制Icon名称"
        inactive-text="复制SVG图标" />
    </div>
    <div class="mr-4">
      <el-switch v-model="showTextFlag" active-text="显示文字"
        inactive-text="隐藏文字" />
    </div>
  </div>
  <VpIconList :show-text="showTextFlag" @click="handleClick"></VpIconList>
</template>
<script setup lang="ts">
// iconify -> element plus
import { loadIcon } from '@iconify/vue'
import { ElMessage } from 'element-plus'

definePage({
  meta: {
    title: '图标列表',
    icon: 'mdi:bookmark-multiple'
  }
})

// false - CopySvgData
// true - CopyName
const copyTypeFlag = ref(true)
const showTextFlag = ref(true)
const copyIconComponentFlag = ref(false)

const { copy, copied } = useClipboard()

function convertString(input: string): string {
  const words = input.split('-')
  const capitalizedWords = words.map((word, index) => {
    if (index === 0) {
      return capitalize(word)
    } else {
      return capitalize(word, true)
    }
  })
  return capitalizedWords.join('')
}

function capitalize(word: string, capitalizeFirstLetter = false): string {
  if (capitalizeFirstLetter) {
    return word.charAt(0).toUpperCase() + word.slice(1)
  } else {
    return word.toLowerCase().replace(/(?:^|-)(\w)/g, (_, c) => c.toUpperCase())
  }
}

function objectToSvg(svgObject: any) {
  const { body, hFlip, height, left, rotate, top, vFlip, width } = svgObject
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" transform="translate(${left},${top}) rotate(${rotate})${hFlip ? ' scale(-1, 1)' : ''
    }${vFlip ? ' scale(1, -1)' : ''}">
        ${body}
    </svg>`
  return svgString
}

async function handleClick(i: string) {
  let textToCopy = ''
  
  if (copyIconComponentFlag.value) {
    textToCopy = `<div class="i-ep:${i}"></div>`
  } else if (!copyTypeFlag.value) {
    const res = await loadIcon('ep:' + i)
    textToCopy = objectToSvg(res)
  } else {
    textToCopy = convertString(i)
  }
  
  await copy(textToCopy)
  
  if (copied.value) {
    ElMessage({
      message: '复制成功',
      type: 'success'
    })
  }
}
</script>

<style scoped></style>
