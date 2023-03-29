export const isString = (val: unknown): val is string => typeof val === 'string'
export const isNumber = (val: unknown): val is number => typeof val === 'number'
export const isBoolean = (val: unknown): val is boolean => typeof val === 'boolean'
export const isFunction = (val: unknown): val is Function => typeof val === 'function'
export const isArray = (val: unknown): val is any[] => Array.isArray(val)
export const isUndefined = (val: unknown): val is undefined => typeof val === 'undefined'
export const isDef = <T = any>(val?: T): val is T => typeof val !== 'undefined'
export const isNull = (val: unknown): val is null => val === null
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'
export const isObject = (val: unknown): val is Record<any, any> => Object.prototype.toString.call(val) === '[object Object]'
export const isDate = (val: unknown): val is Date => Object.prototype.toString.call(val) === '[object Date]'
export const isBaseType = (val: unknown): val is string | number | boolean | symbol | undefined | null => {
  return isString(val) || isNumber(val) || isBoolean(val) || isSymbol(val) || isUndefined(val) || isNull(val)
}

export const tuple = <T extends string[]>(...args: T) => args

export const tupleNum = <T extends number[]>(...args: T) => args

export function pick<O, K extends keyof O, R extends Record<string, any>>(obj: O, keys: K[] = [], rest?: R): Pick<O, K> & (R extends undefined ? {} : R) {
  const newObj: any = {}
  const names: K[] = Object.getOwnPropertyNames(obj) as K[]
  names.forEach((name) => {
    if ((keys as string[]).includes(name as string)) newObj[name] = obj[name]
  })
  return Object.assign(newObj, rest)
}

export function omit<T, K extends keyof T, R extends Record<string, any>>(object: T, keys: K[] = [], rest?: R): Omit<T, K> & (R extends undefined ? {} : R) {
  if (object === null || object === undefined) return (rest || object) as any

  const omitedObject: any = {}
  const originalKeys = Object.getOwnPropertyNames(object)
  originalKeys.forEach((originalKey) => {
    if (!(keys as string[]).includes(originalKey)) omitedObject[originalKey] = object[originalKey as keyof T]
  })
  return Object.assign(omitedObject, rest)
}

export const isUrl = (val: string): boolean => {
  const reg = /^(https?|mailto|tel|file):/
  return reg.test(val)
}

export const tupleArr = <T extends string[]>(...args: T) => args

export const tupleNumArr = <T extends number[]>(...args: T) => args

export const toArray = <T>(val: T): T[] => {
  return isArray(val) ? val : [val]
}
