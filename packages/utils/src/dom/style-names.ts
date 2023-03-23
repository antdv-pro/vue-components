import { isArray, isObject, isString } from '../base'

function parserStyleString(styleString: string): Record<string, any> {
  const styleObject: Record<string, any> = {}
  const styleArray = styleString.split(';')
  for (const style of styleArray) {
    if (!style) continue
    const styleItem = style.split(':')
    if (!styleItem[0]) continue
    styleObject[styleItem[0]] = styleItem[1]
  }
  return styleObject
}

export function styleNames(...names: any[]): undefined | Record<string, any> {
  if (names.length < 1) return undefined
  const styleObject: Record<string, any> = {}
  for (const name of names) {
    if (!name) continue

    if (isString(name)) {
      Object.assign(styleObject, parserStyleString(name))
    }
    else if (isArray(name)) {
      const style = styleNames(...name)
      if (style) Object.assign(styleObject, style)
    }
    else if (isObject(name)) {
      Object.assign(styleObject, name)
    }
  }
  return styleObject
}
