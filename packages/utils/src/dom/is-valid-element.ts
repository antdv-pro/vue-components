import type { VNodeChild } from 'vue'

export function isValidElement(element: VNodeChild) {
  if (Array.isArray(element) && element.length === 1)
    element = element[0]

  return element && (element as any).__v_isVNode && typeof (element as any).type !== 'symbol' // remove text node
}
