import type { CSSProperties, ExtractPropTypes, Ref } from 'vue'
import { Transition, defineComponent } from 'vue'
import {
  anyType,
  booleanType,
  eventType,
  numberType,
  objectType,
  someType,
  stringType,
} from '@v-c/utils'
import type { MotionEventHandler, MotionPrepareEventHandler, MotionStatus } from './interface'
import { getTransitionName } from './util/motion'

export type CSSMotionConfig =
    | boolean
    | {
      transitionSupport?: boolean
      /** @deprecated, no need this anymore since `rc-motion` only support latest react */
      forwardRef?: boolean
    }

export type MotionName =
    | string

/**
 *  motionName?: MotionName;
 *   visible?: boolean;
 *   motionAppear?: boolean;
 *   motionEnter?: boolean;
 *   motionLeave?: boolean;
 *   motionLeaveImmediately?: boolean;
 *   motionDeadline?: number;
 */
export const cssMotionProps = {
  motionName: someType<string | MotionName>([String, Object]),
  visible: booleanType(),
  motionAppear: booleanType(),
  motionEnter: booleanType(),
  motionLeave: booleanType(),
  motionLeaveImmediately: booleanType(),
  motionDeadline: numberType(),
  /**
     * Create element in view even the element is invisible.
     * Will patch `display: none` style on it.
     */
  forceRender: booleanType(),

  /**
     * Remove element when motion end. This will not work when `forceRender` is set.
     */
  removeOnLeave: booleanType(),
  leavedClassName: stringType(),
  /** @private Used by CSSMotionList. Do not use in your production. */
  eventProps: objectType(),

  // Prepare groups
  /** Prepare phase is used for measure element info. It will always trigger even motion is off */
  onAppearPrepare: eventType<MotionPrepareEventHandler>(),
  /** Prepare phase is used for measure element info. It will always trigger even motion is off */
  onEnterPrepare: eventType<MotionPrepareEventHandler>(),
  /** Prepare phase is used for measure element info. It will always trigger even motion is off */
  onLeavePrepare: eventType<MotionPrepareEventHandler>(),

  // Normal motion groups
  onAppearStart: eventType<MotionEventHandler>(),
  onEnterStart: eventType<MotionEventHandler>(),
  onLeaveStart: eventType<MotionEventHandler>(),

  onAppearActive: eventType<MotionEventHandler>(),
  onEnterActive: eventType<MotionEventHandler>(),
  onLeaveActive: eventType<MotionEventHandler>(),

  onAppearEnd: eventType<MotionEventHandler>(),
  onEnterEnd: eventType<MotionEventHandler>(),
  onLeaveEnd: eventType<MotionEventHandler>(),

  // Special
  /** This will always trigger after final visible changed. Even if no motion configured. */
  onVisibleChanged: eventType<(visible: boolean) => void>(),

  internalRef: anyType<Ref>(),
}

export type CSSMotionProps = Partial<ExtractPropTypes<typeof cssMotionProps>>
export interface CSSMotionState {
  newStatus?: boolean
  prevProps?: CSSMotionProps
  status?: MotionStatus
  statusActive?: boolean
  statusStyle?: CSSProperties
}

export default defineComponent({
  name: 'CSSMotion',
  props: cssMotionProps,
  setup(props, { slots }) {
    return () => {
      const { motionAppear, motionDeadline, eventProps, visible, motionName, leavedClassName } = props
      // 判断当前是vif还是vshow
      const mergedProps = { ...eventProps, visible }
      return (
          <Transition
              appear={motionAppear}
              duration={motionDeadline}
              name={motionName}
              enterFromClass={getTransitionName(motionName, 'enter')}
              enterToClass={getTransitionName(motionName, 'enter-active')}
              leaveFromClass={getTransitionName(motionName, 'leave')}
              leaveToClass={getTransitionName(motionName, 'leave-active')}
          >
            {slots.default?.(mergedProps)}
          </Transition>
      )
    }
  },
})
