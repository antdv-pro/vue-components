import type { Ref } from 'vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { isFunction } from '../../base'

type Updater<T> = T | ((prevValue: T) => T)

export type SetState<T> = (
  nextValue: Updater<T>,
/**
     * Will not update state when destroyed.
     * Developer should make sure this is safe to ignore.
     */
  ignoreDestroy?: boolean,
) => void

export const useState = <T = any>(defaultValue?: T | (() => T)): [Ref<T>, SetState<T>] => {
  const destroyRef = ref(false)
  const state = ref()
  if (isFunction(defaultValue))
    state.value = defaultValue()
  else
    state.value = defaultValue

  onMounted(() => {
    destroyRef.value = false
  })
  onBeforeUnmount(() => {
    destroyRef.value = true
  })

  const safeSetState: SetState<T> = (nextValue, ignoreDestroy = false) => {
    if (ignoreDestroy && destroyRef.value) return
    if (isFunction(nextValue))
      state.value = nextValue(state.value)
    else
      state.value = nextValue
  }
  return [state, safeSetState]
}
