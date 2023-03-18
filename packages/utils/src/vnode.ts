import type { Slot, VNode, VNodeChild } from 'vue'
import { Fragment } from 'vue'
import { isFunction } from './base'

export const getSlotsProps = <S extends object, P extends object, K extends keyof S, KP extends keyof P>(slots: S, props: P, key: K | KP, ...args: any[]) => {
  if (key in slots && isFunction(slots[key as K])) {
    const slot: Slot = slots[key as K] as Slot
    return slot?.(...args)
  }
  if (key in props) {
    const prop = props[key as KP]
    if (isFunction(prop)) return prop(...args)
    return prop
  }
  return null
}

export const hasSlotProps = <S extends object, P extends object, K extends keyof S, KP extends keyof P>(slots: S, props: P, key: K | KP) => {
  if (key in slots && slots[key as K]) return true
  return !!(key in props && props[key as KP])
}

export function isEmptyElement(c: any) {
  return c && (c.type === Comment || (c.type === Fragment && c.children.length === 0) || (c.type === Text && c.children.trim() === ''))
}

export function filterEmpty(children: VNodeChild[] = []) {
  const res: VNodeChild[] = []
  children.forEach((child) => {
    if (Array.isArray(child))
      res.push(...child)
    else if ((child as any)?.type === Fragment)
      res.push(...filterEmpty((child as any).children))
    else
      res.push(child)
  })
  return res.filter(c => !isEmptyElement(c as VNode))
}
