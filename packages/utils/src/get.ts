import { isBaseType } from './base'
import { cloneDeep } from './'
export const get = (obj: Record<string, any>, key: string): any => {
  if (!obj) return undefined
  const info = obj[key]
  const keys = key.split('.')
  if (info) return info

  if (keys.length === 1) return undefined

  const popKeys = cloneDeep(keys)
  let objData
  const objKeys: any[] = []
  while (popKeys.length > 0) {
    const keyInfo = popKeys.pop()
    objKeys.unshift(keyInfo)
    const popKey = popKeys.join('.')
    const popInfo = obj[popKey]
    if (popInfo) {
      objData = popInfo
      break
    }
  }
  if (!objData) return undefined

  if (objKeys.length === 1) return objData[objKeys[0]]

  const allKey = objKeys.join('.')
  const allData = objData[allKey]
  if (allData && isBaseType(allData)) return allData

  if (!objData[objKeys[0]]) return get(objData, objKeys.join('.'))

  while (objKeys.length > 1) {
    const firstKey = objKeys.shift()
    const info = objData[firstKey]
    if (info && isBaseType(info)) return info

    if (info && typeof info === 'object') return get(info, objKeys.join('.'))

    if (objKeys.length === 0) break
  }
  return info
}
