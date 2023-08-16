<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'

const navList = [
  { id: 1, name: 'Following', path: '/follow' },
  { id: 2, name: 'For You', path: '/foryou' }
] as const

const router = useRouter()
const currentPage = ref()
const selectPage = (navItemIdx: number) => {
  currentPage.value = navList[navItemIdx]
  router.push(currentPage.value.path)
}

const route = useRoute()
const pagePath = route.path
let pageIdx = navList.findIndex((item) => item.path === pagePath)
pageIdx = pageIdx === -1 ? 1 : pageIdx
selectPage(pageIdx)
</script>

<template>
  <RouterView class="w-full h-screen bg-black/[0.8] overflow-y-auto" />
  <nav class="fixed top-3 left-0 w-full text-center z-10">
    <span
      v-for="(item, idx) in navList"
      :key="item.id"
      class="px-3 font-bold"
      :class="{
        'text-gray-400': item.id !== currentPage.id,
        'text-white': item.id === currentPage.id,
        'border-l border-gray-400': idx !== 0
      }"
      @click="selectPage(idx)"
      >{{ item.name }}</span
    >
  </nav>
</template>

<style scoped></style>
