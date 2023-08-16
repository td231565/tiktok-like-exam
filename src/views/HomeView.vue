<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import useFetch from '@/apis/index'
import Hls from 'hls.js'
import { useVideoStore } from '@/stores/video'

const prop = defineProps<{
  page: 'foryou' | 'follow'
}>()
const videoStore = useVideoStore()
const refVideoList = ref()

// 依瀏覽器支援度對原生 <video> 處理
const loadVideo = () => {
  if (Hls.isSupported()) {
    refVideoList.value.querySelectorAll('video').forEach((el: HTMLVideoElement, idx: number) => {
      const hls = new Hls()
      hls.attachMedia(el)
      hls.on(Hls.Events.MEDIA_ATTACHED, function () {
        hls.loadSource(list.value[idx].play_url)
      })
    })
  } else if (
    refVideoList.value.querySelector('video').canPlayType('application/vnd.apple.mpegurl')
  ) {
    // on ios
  } else {
    alert('not supported hls video')
  }
}

// 更新影片進度
const updateVideoProgress = (e: Event, videoIdx: number) => {
  const { currentTime, duration } = e.target as HTMLVideoElement
  const progress = (currentTime / duration) * 100
  list.value[videoIdx].duration = duration
  list.value[videoIdx].progress = progress
}

// 影片播放結束時重新播放
// const replayVideo = (e: Event) => {
//   const video = e.target as HTMLVideoElement
//   video.currentTime = 0
//   video.play()
// }

// 對應進度條控制影片進度
const handlerProgress = (e: Event, videoIdx: number) => {
  const el = e.target as HTMLInputElement
  const progressValue = Number(el.value)
  const duration = list.value[videoIdx].duration
  const newTime = (progressValue / 100) * duration
  const video = document.getElementById(`video_${videoIdx + 1}`) as HTMLVideoElement
  if (video) {
    video.currentTime = newTime
  }
}

// 移動至影片
const moveToVideoAndPlay = (videoIdx: number, behavior = 'instant') => {
  const videoContainers = refVideoList.value.querySelectorAll('div.video-container')
  const elTop = videoContainers[videoIdx].offsetTop
  refVideoList.value.scrollTo({
    top: elTop,
    behavior
  })
  videoStore.selectVideo(prop.page, videoIdx)
  videoContainers[videoIdx].querySelector('video').play()
  list.value[videoIdx].paused = false
}

const handlerVideoEnd = async (videoIdx: number) => {
  if (videoStore.playingVideo[prop.page] !== videoIdx) {
    return
  }
  const video = document.getElementById(`video_${videoIdx + 1}`) as HTMLVideoElement
  if (!video) {
    return
  }
  video.currentTime = 0
  video.pause()
  list.value[videoIdx].paused = true
  if (videoIdx < list.value.length - 1) {
    moveToVideoAndPlay(videoIdx + 1)
  } else {
    await getList(prop.page)
  }
}

// 判斷手勢是否移動影片
const scrollHandler = () => {
  const videoContainers = refVideoList.value.querySelectorAll('div.video-container')
  let currentVideoIdx = 0
  let startY = 0
  let endY = 0
  refVideoList.value.addEventListener('touchstart', (e: TouchEvent) => {
    startY = e.targetTouches[0].clientY
    endY = startY
  })
  refVideoList.value.addEventListener('touchmove', (e: TouchEvent) => {
    endY = e.targetTouches[0].clientY
  })
  refVideoList.value.addEventListener('touchend', (e: TouchEvent) => {
    const trigger = 50
    const isDown = endY - startY < 0
    const movedDistance = Math.abs(endY - startY)
    if (movedDistance > trigger && isDown && currentVideoIdx < videoContainers.length - 1) {
      const video = document.getElementById(`video_${currentVideoIdx + 1}`) as HTMLVideoElement
      video.pause()
      list.value[currentVideoIdx].paused = true
      currentVideoIdx++
      moveToVideoAndPlay(currentVideoIdx, 'smooth')
    } else if (movedDistance > trigger && !isDown && currentVideoIdx > 0) {
      const video = document.getElementById(`video_${currentVideoIdx + 1}`) as HTMLVideoElement
      video.pause()
      list.value[currentVideoIdx].paused = true
      currentVideoIdx--
      moveToVideoAndPlay(currentVideoIdx, 'smooth')
    }
  })
}

// 取得影片清單
const isLoading = ref(false)
const list = ref()
const videoList = [
  { name: 'foryou', apiPath: '/for_you_list' },
  { name: 'follow', apiPath: '/following_list' }
] as const
const getList = async (pageName: 'foryou' | 'follow') => {
  isLoading.value = true
  try {
    const currPage = videoList.find((item) => item.name === pageName)
    const api = currPage ? currPage.apiPath : videoList[0].apiPath
    const res = await useFetch(api)
    list.value = res.items.map((item: any) => ({
      ...item,
      paused: true,
      progress: 0,
      duration: 0
    }))
    await nextTick()
    loadVideo()
    const playingVideoIdx = videoStore.playingVideo[pageName] || 0
    moveToVideoAndPlay(playingVideoIdx)
    scrollHandler()
    isLoading.value = false
  } catch (err) {
    console.log(err)
    alert(err)
    isLoading.value = false
  }
}

watch(
  () => prop.page,
  (pageName) => {
    if (!videoList.map(({ name }) => name).includes(pageName)) {
      pageName = 'foryou'
    }
    getList(pageName)
  },
  { immediate: true }
)

// 裝置是否為 iphone
// const isiPhone = () => /iPhone|iPod/i.test(navigator.userAgent)

// 是否靜音
const isMuted = ref(true)
const switchMuted = () => (isMuted.value = !isMuted.value)

// 影片是否播放
const switchVideoPlay = (e: MouseEvent, videoIdx: number) => {
  const video = e.target as HTMLVideoElement
  if (!video) {
    return
  }
  if (video.paused) {
    video.play()
  } else {
    video.pause()
  }
  list.value[videoIdx].paused = video.paused
}
</script>

<template>
  <div ref="refVideoList" class="relative w-full h-screen">
    <button
      v-if="isMuted"
      class="fixed top-10 left-10 px-4 py-1 bg-gray-200 border-none rounded-md z-10"
      @click="switchMuted"
    >
      取消靜音
    </button>
    <div
      v-for="(item, idx) in list"
      :key="item.title"
      class="relative w-full h-full video-container"
    >
      <video
        :id="`video_${idx + 1}`"
        class="absolute top-0 w-full h-full object-cover"
        :poster="item.cover"
        :muted="isMuted"
        playsinline
        @click="switchVideoPlay($event, idx)"
        @timeupdate="updateVideoProgress($event, idx)"
        @ended="handlerVideoEnd(idx)"
      >
        <source :src="item.play_url" type="application/x-mpegURL" />
      </video>
      <!-- Controller -->
      <div
        class="flex justify-center absolute bottom-[150px] left-1/2 -translate-x-1/2 p-2 bg-black/[0.4] rounded-xl"
      >
        <input
          type="range"
          min="0"
          max="100"
          :value="item.progress"
          @input="handlerProgress($event, idx)"
        />
        <span class="font-bold text-white text-center ml-3 w-[72px]">
          {{ item.paused ? 'PAUSE' : 'PLAYING' }}
        </span>
      </div>
    </div>
  </div>
</template>
