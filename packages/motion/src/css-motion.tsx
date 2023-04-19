import type { CSSProperties, ExtractPropTypes, Ref, VNodeChild } from 'vue'
import { computed, defineComponent, ref } from 'vue'
import {
  anyType,
  booleanType,
  eventType, findDOMNode,
  numberType,
  objectType,
  someType,
  stringType,
} from '@v-c/utils'
import { useCSSMotionContext } from './context'
import DomWrapper from './dom-wrapper'
import useStatus from './hooks/use-status'
import { isActive } from './hooks/use-step-queue'
import { STATUS_NONE, STEP_PREPARE, STEP_START } from './interface'
import type { MotionEventHandler, MotionPrepareEventHandler, MotionStatus } from './interface'
import { getTransitionName, supportTransition } from './util/motion'

export type CSSMotionConfig =
    | boolean
    | {
      transitionSupport?: boolean
      /** @deprecated, no need this anymore since `rc-motion` only support latest react */
      forwardRef?: boolean
    }
export type MotionName =
    | string
    | {
      appear?: string
      enter?: string
      leave?: string
      appearActive?: string
      enterActive?: string
      leaveActive?: string
    }

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
  visible: booleanType(true),
  motionAppear: booleanType(true),
  motionEnter: booleanType(true),
  motionLeave: booleanType(true),
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
  removeOnLeave: booleanType(true),
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

export function genCSSMotion(
  config: CSSMotionConfig = {},
) {
  let transitionSupport = config

  if (typeof config === 'object')
    ({ transitionSupport } = config as any)

  function isSupportTransition(props: CSSMotionProps, contextMotion?: boolean) {
    return !!(props.motionName && transitionSupport && contextMotion !== false)
  }
  return defineComponent({
    name: 'CSSMotion',
    props: cssMotionProps,
    setup(props, { slots }) {
      const { motion: motionContext } = useCSSMotionContext()
      const supportMotion = computed(() => isSupportTransition(props, motionContext.value))
      // Ref to the react node, it may be a HTMLElement
      const nodeRef = ref()

      // Ref to the dom wrapper in case ref can not pass to HTMLElement
      const wrapperNodeRef = ref()

      function getDomElement() {
        try {
          return findDOMNode(
            nodeRef.value || wrapperNodeRef.value,
          ) as HTMLElement
        }
        catch (err) {
          // Only happen when `motionDeadline` trigger but element removed.
          return null
        }
      }

      const [status, statusStep, statusStyle, mergedVisible] = useStatus(
        supportMotion,
        computed(() => props.visible!),
        getDomElement,
        props,
      )

      // ====================== Refs ======================
      const setNodeRef = (node: any) => {
        nodeRef.value = node
      }

      return () => {
        const children = slots.default
        let motionChildren: VNodeChild | null = null
        const {
          eventProps,
          removeOnLeave,
          forceRender,
          motionName,
          leavedClassName,
        } = props
        // Record whether content has rendered
        // Will return null for un-rendered even when `removeOnLeave={false}`
        let renderedRef = mergedVisible.value
        if (mergedVisible.value) renderedRef = true

        if (!children) {
          // No children
          motionChildren = null
        }
        else if (status.value === STATUS_NONE || !isSupportTransition(props)) {
          if (mergedVisible.value) {
            motionChildren = children({ ...eventProps, ref: setNodeRef })
          }
          else if (!removeOnLeave && renderedRef && leavedClassName) {
            motionChildren = children({
              ...eventProps,
              class: leavedClassName,
              ref: setNodeRef,
            })
          }
          else if (forceRender || (!removeOnLeave && !leavedClassName)) {
            motionChildren = children({
              ...eventProps,
              style: { display: 'none' },
              ref: setNodeRef,
            })
          }
          else {
            motionChildren = null
          }
        }
        else {
          // In motion
          let statusSuffix: string
          if (statusStep.value === STEP_PREPARE)
            statusSuffix = 'prepare'
          else if (isActive(statusStep.value))
            statusSuffix = 'active'
          else if (statusStep.value === STEP_START)
            statusSuffix = 'start'

          const motionCls = getTransitionName(
            motionName,
              `${status.value}-${statusSuffix!}`,
          )
          const childProps = {
            ...eventProps,
            class: [
              getTransitionName(motionName, status.value),
              {
                // @ts-expect-error this is a bug of ts
                [motionCls]: motionCls && !!statusSuffix,
                [motionName as string]: typeof motionName === 'string',
              },
            ],
            style: statusStyle.value,
            ref: setNodeRef,
          }
          motionChildren = children(childProps)
        }
        return <DomWrapper ref="wrapperNodeRef">{motionChildren}</DomWrapper>
      }
    },
  })
}
export default genCSSMotion(supportTransition)
