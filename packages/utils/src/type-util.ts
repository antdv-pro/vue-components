import type { PropType, VNodeChild } from 'vue'

export type vueNode = VNodeChild | string | number | boolean | null | undefined
export function stringType<T extends string = string>(defaultVal?: T) {
  return {
    type: String as unknown as PropType<T>,
    default: defaultVal as T,
  }
}

export function numberType<T extends number = number>(defaultVal?: T) {
  return {
    type: Number as unknown as PropType<T>,
    default: defaultVal as T,
  }
}

export function booleanType<T extends boolean = boolean>(defaultVal?: T) {
  return {
    type: Boolean as unknown as PropType<T>,
    default: defaultVal as T,
  }
}

export function arrayType<T extends any[] = any[]>(defaultVal?: T) {
  return {
    type: Array as unknown as PropType<T>,
    default: defaultVal as T,
  }
}

export function objectType<T extends Record<string, any> = Record<string, any>>(defaultVal?: T) {
  return {
    type: Object as unknown as PropType<T>,
    default: defaultVal as T,
  }
}

export function functionType<T = (() => any)>(defaultVal?: T) {
  return {
    type: Function as unknown as PropType<T>,
    default: defaultVal as T,
  }
}

export function anyType<T = any>(defaultVal?: T, required?: boolean) {
  const type = { validator: () => true, default: defaultVal as T } as unknown
  return required
    ? (type as {
        type: PropType<T>
        default: T
        required: true
      })
    : (type as {
        default: T
        type: PropType<T>
      })
}

export function vNodeType<T = vueNode>() {
  return { validator: () => true } as unknown as { type: PropType<T> }
}

export function someType<T>(types?: any[], defaultVal?: T) {
  return types ? { type: types as PropType<T>, default: defaultVal as T } : anyType<T>(defaultVal)
}

export function eventType<T>() {
  return { type: [Function, Array] as PropType<T> }
}

export function runEvent<T>(event: T, ...args: any[]) {
  if (typeof event === 'function')
    return event(...args)

  else if (Array.isArray(event))
    return event.map(e => e(...args))
}

export async function runAsyncEvent<T>(event: T, ...args: any[]) {
  if (typeof event === 'function')
    return await event(...args)

  else if (Array.isArray(event))
    return await Promise.all(event.map(e => e(...args)))
}

export function getEventValue<T = any>(result: any, index = 0): T {
  if (Array.isArray(result))
    return result[index] as T
  return result as T
}
