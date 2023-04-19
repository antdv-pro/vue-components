import { onBeforeUnmount, onMounted, shallowRef } from 'vue'
import type { MotionEvent } from '../interface'
import { animationEndName, transitionEndName } from '../util/motion'

const useDomMotionEvents = (callback: (event: MotionEvent) => void) => {
  const cacheElementRef = shallowRef<HTMLElement>()

  // Cache callback
  const callbackRef = shallowRef(callback)
  onMounted(() => {
    callbackRef.value = callback
  })

  // Internal motion event handler
  const onInternalMotionEnd = (event: MotionEvent) => {
    if (callbackRef.value)
      callbackRef.value(event)
  }

  // Remove events
  function removeMotionEvents(element: HTMLElement) {
    if (element) {
      element.removeEventListener(transitionEndName, onInternalMotionEnd)
      element.removeEventListener(animationEndName, onInternalMotionEnd)
    }
  }

  // Patch events
  function patchMotionEvents(element: HTMLElement) {
    if (cacheElementRef.value && cacheElementRef.value !== element)
      removeMotionEvents(cacheElementRef.value)

    if (element && element !== cacheElementRef.value) {
      element.addEventListener(transitionEndName, onInternalMotionEnd)
      element.addEventListener(animationEndName, onInternalMotionEnd)

      // Save as cache in case dom removed trigger by `motionDeadline`
      cacheElementRef.value = element
    }
  }

  onBeforeUnmount(() => {
    removeMotionEvents(cacheElementRef.value!)
  })
  return [patchMotionEvents, removeMotionEvents]
}

export default useDomMotionEvents
