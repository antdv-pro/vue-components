import { effectScope } from 'vue'

export type CreateGlobalStateReturn<T> = () => T

export function createGlobalState<T>(stateFactory: () => T): CreateGlobalStateReturn<T> {
  let initialized = false
  let state: T
  const scope = effectScope(true)

  return () => {
    if (!initialized) {
      state = scope.run(stateFactory)!
      initialized = true
    }
    return state
  }
}
