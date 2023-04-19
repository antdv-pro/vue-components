import { canUseDom } from '@v-c/utils'
import { watch } from 'vue'

// It's safe to use `useLayoutEffect` but the warning is annoying
const useIsomorphicLayoutEffect = (callback: Function, deps: any) => {
  watch(deps, () => {
    callback()
  }, {
    flush: canUseDom() ? 'post' : 'pre',
    immediate: true,
  })
}

export default useIsomorphicLayoutEffect
