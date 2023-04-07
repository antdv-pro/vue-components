import { computed, defineComponent, ref } from 'vue'
import type { CSSProperties, Ref, ShallowUnwrapRef, VNodeChild } from 'vue'
import { booleanType, findDOMNode, functionType, numberType, objectType, someType, stringType } from '@v-c/utils'
import DomWrapper from './DomWrapper'

import type {
  MotionEndEventHandler,
  MotionEventHandler,
  MotionPrepareEventHandler,
  MotionStatus,
  StepStatus,
} from './interface'
import {
  STATUS_NONE,
  STEP_PREPARE,
  STEP_START,
} from './interface'

import { getTransitionName, supportTransition } from './util/motion'
import { isActive } from './hooks/useStepQueue'
import useStatus from './hooks/useStatus'

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

export interface CSSMotionProps {
  motionName?: MotionName
  visible?: boolean
  motionAppear?: boolean
  motionEnter?: boolean
  motionLeave?: boolean
  motionLeaveImmediately?: boolean
  motionDeadline?: number
  /**
   * Create element in view even the element is invisible.
   * Will patch `display: none` style on it.
   */
  forceRender?: boolean
  /**
   * Remove element when motion end. This will not work when `forceRender` is set.
   */
  removeOnLeave?: boolean
  leavedClass?: string
  /** @private Used by CSSMotionList. Do not use in your production. */
  eventProps?: object

  // Prepare groups
  onAppearPrepare?: MotionPrepareEventHandler
  onEnterPrepare?: MotionPrepareEventHandler
  onLeavePrepare?: MotionPrepareEventHandler

  // Normal motion groups
  onAppearStart?: MotionEventHandler
  onEnterStart?: MotionEventHandler
  onLeaveStart?: MotionEventHandler

  onAppearActive?: MotionEventHandler
  onEnterActive?: MotionEventHandler
  onLeaveActive?: MotionEventHandler

  onAppearEnd?: MotionEndEventHandler
  onEnterEnd?: MotionEndEventHandler
  onLeaveEnd?: MotionEndEventHandler

  // Special
  /** This will always trigger after final visible changed. Even if no motion configured. */
  onVisibleChanged?: (visible: boolean) => void

  internalRef?: Ref<any>
}

export interface CSSMotionRawBindings {
  status: Ref<MotionStatus>
  mergedVisible: Ref<boolean>
  setNodeRef: (node: any) => void
  statusStep: Ref<StepStatus>
  statusStyle: Ref<CSSProperties>
}

export const getCSSMotionPropTypes = () => ({
  motionName: someType<MotionName | string>([Object, String]),

  visible: booleanType(true),
  motionAppear: booleanType(true),
  motionEnter: booleanType(true),
  motionLeave: booleanType(true),
  motionLeaveImmediately: booleanType(),
  motionDeadline: numberType(),
  forceRender: booleanType(),
  removeOnLeave: booleanType(true),
  leavedClass: stringType(),
  eventProps: objectType(),

  onAppearPrepare: functionType(),
  onEnterPrepare: functionType(),
  onLeavePrepare: functionType(),

  onAppearStart: functionType(),
  onEnterStart: functionType(),
  onLeaveStart: functionType(),

  onAppearActive: functionType(),
  onEnterActive: functionType(),
  onLeaveActive: functionType(),

  onAppearEnd: functionType(),
  onEnterEnd: functionType(),
  onLeaveEnd: functionType(),

  onVisibleChanged: functionType(),
})

/**
 * `transitionSupport` is used for none transition test case.
 * Default we use browser transition event support check.
 */
export function genCSSMotion(transitionSupport?: boolean) {
  function isSupportTransition(props: CSSMotionProps) {
    return !!(props.motionName && transitionSupport)
  }

  return defineComponent<CSSMotionProps, CSSMotionRawBindings>({
    name: 'CSSMotion',

    props: getCSSMotionPropTypes() as any,

    setup(props) {
      const supportMotion = isSupportTransition(props)

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

      return {
        status,
        mergedVisible,
        setNodeRef,
        statusStep,
        statusStyle,
      }
    },

    // ===================== Render =====================
    render() {
      const children = this.$slots.default
      let motionChildren: VNodeChild | null = null

      const props: CSSMotionProps = this.$props
      const {
        eventProps,
        removeOnLeave,
        leavedClass,
        forceRender,
        motionName,
      } = props
      const {
        mergedVisible,
        status,
        setNodeRef,
        statusStep,
        statusStyle,
      }: ShallowUnwrapRef<CSSMotionRawBindings> = this

      if (!children) {
        // No children
        motionChildren = null
      }
      else if (status === STATUS_NONE || !isSupportTransition(props)) {
        // Stable children
        if (mergedVisible) {
          motionChildren = children({ ...eventProps, ref: setNodeRef })
        }
        else if (!removeOnLeave) {
          motionChildren = children({
            ...eventProps,
            class: leavedClass,
            ref: setNodeRef,
          })
        }
        else if (forceRender) {
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
        if (statusStep === STEP_PREPARE)
          statusSuffix = 'prepare'
        else if (isActive(statusStep))
          statusSuffix = 'active'
        else if (statusStep === STEP_START)
          statusSuffix = 'start'

        motionChildren = children({
          ...eventProps,

          class: [
            getTransitionName(motionName!, status),
            {
              [getTransitionName(
                motionName!,
                `${status}-${statusSuffix!}`,
              )]: statusSuffix!,
              [motionName as string]: typeof motionName === 'string',
            },
          ],

          style: statusStyle,

          ref: setNodeRef,
        })
      }

      return <DomWrapper ref="wrapperNodeRef">{motionChildren}</DomWrapper>
    },
  })
}

export default genCSSMotion(supportTransition)
