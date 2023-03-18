import canUseDom from '../lib/can-use-dom'

const isStyleNameSupport = (styleName: string | string[]): boolean => {
  if (canUseDom() && window.document.documentElement) {
    const styleNameList = Array.isArray(styleName) ? styleName : [styleName]
    const { documentElement } = window.document

    return styleNameList.some(name => name in documentElement.style)
  }
  return false
}

const isStyleValueSupport = (styleName: string, value: any) => {
  if (!isStyleNameSupport(styleName))
    return false

  const ele = document.createElement('div')
  const origin = ele.style[styleName as any]
  ele.style[styleName as any] = value
  return ele.style[styleName as any] !== origin
}

export function isStyleSupport(styleName: string | string[]): boolean
export function isStyleSupport(styleName: string, styleValue: any): boolean

export function isStyleSupport(styleName: string | string[], styleValue?: any) {
  if (!Array.isArray(styleName) && styleValue !== undefined)
    return isStyleValueSupport(styleName, styleValue)

  return isStyleNameSupport(styleName)
}
