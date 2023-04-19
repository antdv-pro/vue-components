import { createInjectionState } from '@v-c/utils'
import { computed } from 'vue'
interface MotionContextProps {
  motion?: boolean
}
const cssMotionState = function (props: MotionContextProps) {
  const motion = computed(() => props.motion)
  return {
    motion,
  }
}
const [useCSSMotionProvider, useCSSMotionInject] = createInjectionState(cssMotionState)

export {
  useCSSMotionProvider,
}

export const useCSSMotionContext = () => useCSSMotionInject() ?? {
  motion: computed(() => true),
}
