import type { VueKey } from '@v-c/utils'
import { arrayType, someType } from '@v-c/utils'
import OriginCSSMotion, { cssMotionProps } from './css-motion'
import type { CSSMotionProps } from './css-motion'
import { supportTransition } from './util/motion'
import {
  STATUS_ADD,
  STATUS_KEEP,
  STATUS_REMOVE,
  STATUS_REMOVED,
  diffKeys,
  parseKeys,
} from './util/diff'
import type { KeyObject } from './util/diff'

const MOTION_PROP_NAMES = [
  'eventProps',
  'visible',
  'children',
  'motionName',
  'motionAppear',
  'motionEnter',
  'motionLeave',
  'motionLeaveImmediately',
  'motionDeadline',
  'removeOnLeave',
  'leavedClassName',
  'onAppearStart',
  'onAppearActive',
  'onAppearEnd',
  'onEnterStart',
  'onEnterActive',
  'onEnterEnd',
  'onLeaveStart',
  'onLeaveActive',
  'onLeaveEnd',
]

// export interface CSSMotionListProps
//   extends Omit<CSSMotionProps, 'onVisibleChanged'>,
//   Omit<React.HTMLAttributes<any>, 'children'> {
//   keys: (React.Key | { key: VueKey; [name: string]: any })[]
//   component?: string | React.ComponentType | false
//
//   /** This will always trigger after final visible changed. Even if no motion configured. */
//   onVisibleChanged?: (visible: boolean, info: { key: React.Key }) => void
//   /** All motion leaves in the screen */
//   onAllRemoved?: () => void
// }

export const cssMotionListProps = {
  ...cssMotionProps,
  keys: arrayType<(VueKey | { key: VueKey;[name: string]: any })[]>(),
  component: someType<string>([String, Object, Boolean]),
}

export interface CSSMotionListState {
  keyEntities: KeyObject[]
}
