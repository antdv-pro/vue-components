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

export function functionType<T extends () => any = () => any>(defaultVal?: T) {
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
