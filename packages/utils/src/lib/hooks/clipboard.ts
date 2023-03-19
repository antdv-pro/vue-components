import type { ComputedRef, Ref, ShallowRef } from 'vue'
import { ref, unref } from 'vue'
import { clipboardCopy } from '../clipboard'

export const useClipboard = (delay = 3000) => {
  const copied = ref(false)
  const copy = (text: string | Ref<string> | ComputedRef<string> | ShallowRef<string>) => {
    const copyText = unref(text)
    clipboardCopy(copyText as string).then(() => {
      copied.value = true
      const timer = setTimeout(() => {
        copied.value = false
        clearTimeout(timer)
      }, delay)
    })
  }
  return {
    copied,
    copy,
  }
}
