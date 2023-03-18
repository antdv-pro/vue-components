import { ref } from 'vue'

export const useState = <T = any>(initialState?: T) => {
  const state = ref<T>(initialState as T)
  const setState = (val: T) => {
    state.value = val as any
  }
  return [state, setState]
}
