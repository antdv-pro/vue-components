import canUseDOM from '../lib/can-use-dom'
const animationEndEventNames = {
  WebkitAnimation: 'webkitAnimationEnd',
  OAnimation: 'oAnimationEnd',
  animation: 'animationend',
}
const transitionEventNames = {
  WebkitTransition: 'webkitTransitionEnd',
  OTransition: 'oTransitionEnd',
  transition: 'transitionend',
}

function supportEnd(names: any) {
  const el = document.createElement('div')
  for (const name in names) {
    // eslint-disable-next-line no-prototype-builtins
    if (names.hasOwnProperty(name) && el.style[name as any] !== undefined) {
      return {
        end: names[name],
      }
    }
  }
  return false
}

export const animation = canUseDOM() && supportEnd(animationEndEventNames)
export const transition = canUseDOM() && supportEnd(transitionEventNames)
