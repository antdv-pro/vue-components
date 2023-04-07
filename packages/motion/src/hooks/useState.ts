import type { UnwrapRef } from 'vue'
import { onBeforeUnmount, ref } from 'vue'

export default function useMountStatus<T>(
  defaultValue?: T,
) {
  const destroyRef = ref(false)
  const val = ref(defaultValue)

  function setValue(next: T) {
    if (!destroyRef.value)
      val.value = next as UnwrapRef<T>
  }

  onBeforeUnmount(() => {
    destroyRef.value = true
  })

  return [val, setValue]
}
