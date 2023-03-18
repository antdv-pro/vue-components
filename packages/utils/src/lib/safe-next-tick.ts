import { isFunction } from '../base'

export const delayTimer = async (delay = 0) => {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve(true)
      clearTimeout(timer)
    }, delay)
  })
}
export function safeNextick(fn?: () => void, option?: { delay: 0 }): void
export async function safeNextick(fn?: () => void, option?: { delay: 0 }): Promise<void>
export async function safeNextick(fn?: () => void, option?: { delay: 0 }) {
  await delayTimer(option?.delay)
  if (fn && isFunction(fn))
    fn()
}
