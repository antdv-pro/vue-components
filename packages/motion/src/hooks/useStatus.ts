import { computed, nextTick, onBeforeUnmount, ref, toRef, watch } from 'vue'
import type { CSSProperties, Ref } from 'vue'
import { useState } from '@v-c/utils'
import type { CSSMotionProps } from '../CSSMotion'

import type {
  MotionEvent,
  MotionEventHandler,
  MotionPrepareEventHandler,
  MotionStatus,
  StepStatus,
} from '../interface'
import {
  STATUS_APPEAR,
  STATUS_ENTER,
  STATUS_LEAVE,
  STATUS_NONE,
  STEP_ACTIVE,
  STEP_PREPARE,
  STEP_START,
} from '../interface'
import useStepQueue, { DoStep, SkipStep, isActive } from './useStepQueue'
import useDomMotionEvents from './useDomMotionEvents'

export default function useStatus(
  supportMotion: boolean,
  visible: Ref<boolean>,
  getElement: () => HTMLElement | null,
  props: CSSMotionProps,
): [Ref<MotionStatus>, Ref<StepStatus>, Ref<CSSProperties>, Ref<boolean>] {
  // Used for outer render usage to avoid `visible: false & status: none` to render nothing
  const [asyncVisible, setAsyncVisible] = useState<boolean>()
  const [status, setStatus] = useState<MotionStatus>(STATUS_NONE)
  const [style, setStyle] = useState<CSSProperties | undefined | null>(null)

  const mountedRef = ref(false)
  const deadlineRef = ref<any>(null)

  // =========================== Dom Node ===========================
  function getDomElement() {
    return getElement()!
  }

  // ========================== Motion End ==========================
  const activeRef = ref(false)

  function onInternalMotionEnd(event: MotionEvent) {
    const element = getDomElement()

    if (event && !event.deadline && event.target !== element) {
      // event exists
      // not initiated by deadline
      // transitionEnd not fired by inner elements
      return
    }

    let canEnd: boolean | void

    if (status.value === STATUS_APPEAR && activeRef.value)
      canEnd = props.onAppearEnd?.(element, event)
    else if (status.value === STATUS_ENTER && activeRef.value)
      canEnd = props.onEnterEnd?.(element, event)
    else if (status.value === STATUS_LEAVE && activeRef.value)
      canEnd = props.onLeaveEnd?.(element, event)

    if (canEnd !== false) {
      setStatus(STATUS_NONE)
      setStyle(null)
    }
  }

  const [patchMotionEvents] = useDomMotionEvents(onInternalMotionEnd)

  // ============================= Step =============================
  const eventHandlers = computed<{
    [STEP_PREPARE]?: MotionPrepareEventHandler
    [STEP_START]?: MotionEventHandler
    [STEP_ACTIVE]?: MotionEventHandler
  }>(() => {
    switch (status.value) {
      case 'appear':
        return {
          [STEP_PREPARE]: props.onAppearPrepare,
          [STEP_START]: props.onAppearStart,
          [STEP_ACTIVE]: props.onAppearActive,
        }

      case 'enter':
        return {
          [STEP_PREPARE]: props.onEnterPrepare,
          [STEP_START]: props.onEnterStart,
          [STEP_ACTIVE]: props.onEnterActive,
        }

      case 'leave':
        return {
          [STEP_PREPARE]: props.onLeavePrepare,
          [STEP_START]: props.onLeaveStart,
          [STEP_ACTIVE]: props.onLeaveActive,
        }

      default:
        return {}
    }
  })

  const [startStep, step] = useStepQueue((newStep) => {
    // Only prepare step can be skip
    if (newStep === STEP_PREPARE) {
      const onPrepare = eventHandlers.value[STEP_PREPARE]
      if (!onPrepare)
        return SkipStep

      return onPrepare(getDomElement())
    }

    // Rest step is sync update
    if (step.value in eventHandlers.value) {
      setStyle(
        (eventHandlers.value as any)[step.value]?.(getDomElement(), null) || null,
      )
    }

    if (step.value === STEP_ACTIVE) {
      // Patch events when motion needed
      patchMotionEvents(getDomElement())

      if (props?.motionDeadline && props.motionDeadline > 0) {
        clearTimeout(deadlineRef.value)

        deadlineRef.value = setTimeout(() => {
          onInternalMotionEnd({
            deadline: true,
          } as MotionEvent)
        }, props.motionDeadline)
      }
    }

    return DoStep
  })

  watch(
    step,
    (step) => {
      activeRef.value = isActive(step)
    },
    { immediate: true },
  )

  // ============================ Status ============================
  // Update with new status
  watch(
    visible,
    (visible) => {
      setAsyncVisible(visible)

      if (!supportMotion)
        return

      const isMounted = mountedRef.value
      mountedRef.value = true

      let nextStatus: MotionStatus | null = null

      // Appear
      if (!isMounted && visible && props.motionAppear)
        nextStatus = STATUS_APPEAR

      // Enter
      if (isMounted && visible && props.motionEnter)
        nextStatus = STATUS_ENTER

      // Leave
      if (
        (isMounted && !visible && props.motionLeave)
        || (!isMounted
          && props.motionLeaveImmediately
          && !visible
          && props.motionLeave)
      )
        nextStatus = STATUS_LEAVE

      // Update to next status
      if (nextStatus) {
        setStatus(nextStatus)
        nextTick(startStep)
      }
    },
    { immediate: true },
  )

  // ============================ Effect ============================
  // Reset when motion changed
  watch(
    [
      toRef(props, 'motionAppear'),
      toRef(props, 'motionEnter'),
      toRef(props, 'motionLeave'),
    ] as const,
    ([motionAppear, motionEnter, motionLeave]) => {
      if (
        // Cancel appear
        (status.value === STATUS_APPEAR && !motionAppear)
        // Cancel enter
        || (status.value === STATUS_ENTER && !motionEnter)
        // Cancel leave
        || (status.value === STATUS_LEAVE && !motionLeave)
      )
        setStatus(STATUS_NONE)
    },
    {
      immediate: true,
    },
  )

  onBeforeUnmount(() => {
    clearTimeout(deadlineRef.value)
  })

  // Trigger `onVisibleChanged`
  watch(
    [asyncVisible, status] as const,
    ([asyncVisible, status]) => {
      if (asyncVisible !== undefined && status === STATUS_NONE)
        props.onVisibleChanged?.(asyncVisible)
    },
    { immediate: true },
  )

  // ============================ Styles ============================
  if (eventHandlers.value[STEP_PREPARE] && step.value === STEP_START)
    style.value = { transition: 'none', ...style.value }

  return [status, step, style as any, asyncVisible ?? visible]
}
