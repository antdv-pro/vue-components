import { isFunction } from '../base'

export const delayTimer = async (delay = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, delay)
  })
}
export function safeNextTick(fn?: () => void, option?: { delay: 0 }): void
export async function safeNextTick(fn?: () => void, option?: { delay: 0 }): Promise<void>
export async function safeNextTick(fn?: () => void, option?: { delay: 0 }) {
  if (fn && isFunction(fn)) {
    await delayTimer(option?.delay)
    fn()
  }
}
