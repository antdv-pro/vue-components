import { canUseDom } from '@v-c/utils'
import { watchEffect } from 'vue'

// It's safe to use `useLayoutEffect` but the warning is annoying
const useIsomorphicLayoutEffect = (callback: Function, deps: any) => {
  watchEffect(() => {
    if (deps)
      callback()
  }, {
    flush: canUseDom() ? 'post' : 'pre',
  })
}

export default useIsomorphicLayoutEffect
