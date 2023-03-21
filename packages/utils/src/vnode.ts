import type { ComponentPublicInstance, SetupContext, Slot, VNode, VNodeChild } from 'vue'
import { Fragment, vShow } from 'vue'
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

export function isNodeVShowFalse(vNode: VNode): boolean {
  const showDir = vNode.dirs?.find(({ dir }) => dir === vShow)
  return !!(showDir && showDir.value === false)
}

export function getSlot(
  instance: ComponentPublicInstance | SetupContext<any>,
  slotName = 'default',
  fallback: VNodeChild[] = [],
): VNodeChild[] {
  const slots = (instance as ComponentPublicInstance)?.$slots || (instance as SetupContext).slots || {}
  const slot = slots[slotName]
  if (slot === undefined) return fallback
  return slot()
}
