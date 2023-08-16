import { reactive } from 'vue'
import { defineStore } from 'pinia'

export const useVideoStore = defineStore('video', () => {
  const playingVideo = reactive({
    foryou: 0,
    follow: 0
  })

  const selectVideo = (page: 'foryou' | 'follow', videoIdx: number) => {
    playingVideo[page] = videoIdx
  }

  return { playingVideo, selectVideo }
})
