import { raf } from '@v-c/utils'
import { onBeforeUnmount, shallowRef } from 'vue'

export default (): [
  (callback: (info: { isCanceled: () => boolean }) => void) => void,
  () => void,
] => {
  const nextFrameRef = shallowRef<number | null >(null)

  function cancelNextFrame() {
    raf.cancel(nextFrameRef.value!)
  }

  function nextFrame(
    callback: (info: { isCanceled: () => boolean }) => void,
    delay = 2,
  ) {
    cancelNextFrame()

    const nextFrameId = raf(() => {
      if (delay <= 1)
        callback({ isCanceled: () => nextFrameId !== nextFrameRef.value })
      else
        nextFrame(callback, delay - 1)
    })

    nextFrameRef.value = nextFrameId
  }

  onBeforeUnmount(() => {
    cancelNextFrame()
  })

  return [nextFrame, cancelNextFrame]
}
